import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ErEnum } from '#common/enums/er.enum';
import { DiskItemCatalog } from '#common/interfaces/disk/disk-item-catalog';
import { DiskItemStatus } from '#common/interfaces/disk/disk-item-status';
import { ProjectLt, ProjectSt } from '#common/interfaces/st-lt';
import {
  ToDiskCreateDevRepoRequest,
  ToDiskCreateDevRepoResponsePayload
} from '#common/interfaces/to-disk/03-repos/to-disk-create-dev-repo';
import { DiskConfig } from '#disk/config/disk-config';
import { getNodesAndFiles } from '#disk/functions/disk/get-nodes-and-files';
import { isPathExist } from '#disk/functions/disk/is-path-exist';
import { checkoutBranch } from '#disk/functions/git/checkout-branch';
import { cloneRemoteToDev } from '#disk/functions/git/clone-remote-to-dev';
import { createGit } from '#disk/functions/git/create-git';
import { getRepoStatus } from '#disk/functions/git/get-repo-status';
import { DiskTabService } from '#disk/services/disk-tab.service';
import { RestoreService } from '#disk/services/restore.service';
import { transformValidSync } from '#node-common/functions/transform-valid-sync';

@Injectable()
export class CreateDevRepoService {
  constructor(
    private diskTabService: DiskTabService,
    private restoreService: RestoreService,
    private cs: ConfigService<DiskConfig>,
    private logger: Logger
  ) {}

  async process(request: any) {
    let orgPath = this.cs.get<DiskConfig['diskOrganizationsPath']>(
      'diskOrganizationsPath'
    );

    let requestValid = transformValidSync({
      classType: ToDiskCreateDevRepoRequest,
      object: request,
      errorMessage: ErEnum.DISK_WRONG_REQUEST_PARAMS,
      logIsJson: this.cs.get<DiskConfig['diskLogIsJson']>('diskLogIsJson'),
      logger: this.logger
    });

    let { orgId, baseProject, devRepoId, initialBranch, sessionBranch } =
      requestValid.payload;

    let projectSt: ProjectSt = this.diskTabService.decrypt<ProjectSt>({
      encryptedString: baseProject.st
    });

    let projectLt: ProjectLt = this.diskTabService.decrypt<ProjectLt>({
      encryptedString: baseProject.lt
    });

    let { projectId, remoteType } = baseProject;

    let { name: projectName } = projectSt;
    let { gitUrl, defaultBranch, privateKeyEncrypted, publicKey, passPhrase } =
      projectLt;

    let orgDir = `${orgPath}/${orgId}`;
    let projectDir = `${orgDir}/${projectId}`;
    let devRepoDir = `${projectDir}/${devRepoId}`;

    //

    // let isOrgExist = await isPathExist(orgDir);
    // if (isOrgExist === false) {
    //   throw new ServerError({
    //     message: ErEnum.DISK_ORG_IS_NOT_EXIST
    //   });
    // }

    // let isProjectExist = await isPathExist(projectDir);
    // if (isProjectExist === false) {
    //   throw new ServerError({
    //     message: ErEnum.DISK_PROJECT_IS_NOT_EXIST
    //   });
    // }

    // let keyDir = `${orgDir}/_keys/${projectId}`;

    // await ensureDir(keyDir);

    let keyDir = await this.restoreService.checkOrgProjectRepoBranch({
      remoteType: remoteType,
      orgId: orgId,
      projectId: projectId,
      projectLt: projectLt,
      repoId: undefined,
      branchId: undefined
    });

    let isDevRepoExist = await isPathExist(devRepoDir);
    if (isDevRepoExist === false) {
      await cloneRemoteToDev({
        orgId: orgId,
        projectId: projectId,
        devRepoId: devRepoId,
        orgPath: orgPath,
        remoteType: remoteType,
        gitUrl: gitUrl,
        keyDir: keyDir,
        privateKeyEncrypted: privateKeyEncrypted,
        publicKey: publicKey,
        passPhrase: passPhrase
      });
    }

    //

    let devGit = await createGit({
      repoDir: devRepoDir,
      remoteType: remoteType,
      keyDir: keyDir,
      gitUrl: gitUrl,
      privateKeyEncrypted: privateKeyEncrypted,
      publicKey: publicKey,
      passPhrase: passPhrase
    });

    let initialCommitHash: string | undefined;

    if (initialBranch) {
      await checkoutBranch({
        projectId: projectId,
        projectDir: projectDir,
        repoId: devRepoId,
        repoDir: devRepoDir,
        branchName: initialBranch,
        git: devGit,
        isFetch: true
      });

      let logResult = await devGit.log({ n: 1 });
      initialCommitHash = logResult.latest?.hash?.substring(0, 7);

      if (sessionBranch) {
        await devGit.checkout(['-b', sessionBranch]);
      }
    }

    let {
      repoStatus,
      currentBranch,
      conflicts,
      changesToCommit,
      changesToPush
    } = <DiskItemStatus>await getRepoStatus({
      projectId: projectId,
      projectDir: projectDir,
      repoId: devRepoId,
      repoDir: devRepoDir,
      git: devGit,
      isFetch: true,
      isCheckConflicts: true
    });

    let itemCatalog = <DiskItemCatalog>await getNodesAndFiles({
      projectId: projectId,
      projectDir: projectDir,
      repoId: devRepoId,
      readFiles: true,
      isRootMproveDir: false
    });

    let payload: ToDiskCreateDevRepoResponsePayload = {
      repo: {
        orgId: orgId,
        projectId: projectId,
        repoId: devRepoId,
        repoStatus: repoStatus,
        currentBranchId: currentBranch,
        conflicts: conflicts,
        nodes: itemCatalog.nodes,
        changesToCommit: changesToCommit,
        changesToPush: changesToPush
      },
      files: itemCatalog.files,
      mproveDir: itemCatalog.mproveDir,
      initialCommitHash: initialCommitHash
    };

    return payload;
  }
}
