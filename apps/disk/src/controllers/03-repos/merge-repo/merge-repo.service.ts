import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ErEnum } from '~common/enums/er.enum';
import { DiskItemCatalog } from '~common/interfaces/disk/disk-item-catalog';
import { DiskItemStatus } from '~common/interfaces/disk/disk-item-status';
import { ProjectLt, ProjectSt } from '~common/interfaces/st-lt';
import {
  ToDiskMergeRepoRequest,
  ToDiskMergeRepoResponsePayload
} from '~common/interfaces/to-disk/03-repos/to-disk-merge-repo';
import { ServerError } from '~common/models/server-error';
import { DiskConfig } from '~disk/config/disk-config';
import { getNodesAndFiles } from '~disk/functions/disk/get-nodes-and-files';
import { checkoutBranch } from '~disk/functions/git/checkout-branch';
import { getRepoStatus } from '~disk/functions/git/get-repo-status';
import { isLocalBranchExist } from '~disk/functions/git/is-local-branch-exist';
import { isRemoteBranchExist } from '~disk/functions/git/is-remote-branch-exist';
import { merge } from '~disk/functions/git/merge';
import { makeFetchOptions } from '~disk/functions/make-fetch-options';
import { DiskTabService } from '~disk/services/disk-tab.service';
import { RestoreService } from '~disk/services/restore.service';
import { transformValidSync } from '~node-common/functions/transform-valid-sync';

@Injectable()
export class MergeRepoService {
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
      classType: ToDiskMergeRepoRequest,
      object: request,
      errorMessage: ErEnum.DISK_WRONG_REQUEST_PARAMS,
      logIsJson: this.cs.get<DiskConfig['diskLogIsJson']>('diskLogIsJson'),
      logger: this.logger
    });

    let {
      orgId,
      baseProject,
      repoId,
      branch,
      theirBranch,
      isTheirBranchRemote,
      userAlias
    } = requestValid.payload;

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
    let repoDir = `${projectDir}/${repoId}`;

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

    // let isRepoExist = await isPathExist(repoDir);
    // if (isRepoExist === false) {
    //   throw new ServerError({
    //     message: ErEnum.DISK_REPO_IS_NOT_EXIST
    //   });
    // }

    // let isBranchExist = await isLocalBranchExist({
    //   repoDir: repoDir,
    //   localBranch: branch
    // });
    // if (isBranchExist === false) {
    //   throw new ServerError({
    //     message: ErEnum.DISK_BRANCH_IS_NOT_EXIST
    //   });
    // }

    // let keyDir = `${orgDir}/_keys/${projectId}`;

    // await ensureDir(keyDir);

    let keyDir = await this.restoreService.checkOrgProjectRepoBranch({
      remoteType: remoteType,
      orgId: orgId,
      projectId: projectId,
      projectLt: projectLt,
      repoId: repoId,
      branchId: branch
    });

    let fetchOptions = makeFetchOptions({
      remoteType: remoteType,
      keyDir: keyDir,
      gitUrl: gitUrl,
      privateKeyEncrypted: privateKeyEncrypted,
      publicKey: publicKey,
      passPhrase: passPhrase
    });

    let isTheirBranchExist =
      isTheirBranchRemote === true
        ? await isRemoteBranchExist({
            repoDir: repoDir,
            remoteBranch: theirBranch,
            fetchOptions: fetchOptions,
            isFetch: true
          })
        : await isLocalBranchExist({
            repoDir: repoDir,
            localBranch: theirBranch
          });
    if (isTheirBranchExist === false) {
      throw new ServerError({
        message: ErEnum.DISK_THEIR_BRANCH_IS_NOT_EXIST
      });
    }

    await checkoutBranch({
      projectId: projectId,
      projectDir: projectDir,
      repoId: repoId,
      repoDir: repoDir,
      branchName: branch,
      fetchOptions: fetchOptions,
      isFetch: true
    });

    //

    await merge({
      projectId: projectId,
      projectDir: projectDir,
      repoId: repoId,
      repoDir: repoDir,
      userAlias: userAlias,
      branch: branch,
      theirBranch:
        isTheirBranchRemote === true ? `origin/${theirBranch}` : theirBranch,
      isTheirBranchRemote: isTheirBranchRemote,
      fetchOptions: fetchOptions
    });

    let {
      repoStatus,
      currentBranch,
      conflicts,
      changesToCommit,
      changesToPush
    } = <DiskItemStatus>await getRepoStatus({
      projectId: projectId,
      projectDir: projectDir,
      repoId: repoId,
      repoDir: repoDir,
      fetchOptions: fetchOptions,
      isFetch: true,
      isCheckConflicts: true
    });

    let itemCatalog = <DiskItemCatalog>await getNodesAndFiles({
      projectId: projectId,
      projectDir: projectDir,
      repoId: repoId,
      readFiles: true,
      isRootMproveDir: false
    });

    let payload: ToDiskMergeRepoResponsePayload = {
      repo: {
        orgId: orgId,
        projectId: projectId,
        repoId: repoId,
        repoStatus: repoStatus,
        currentBranchId: currentBranch,
        conflicts: conflicts,
        nodes: itemCatalog.nodes,
        changesToCommit: changesToCommit,
        changesToPush: changesToPush
      },
      files: itemCatalog.files,
      mproveDir: itemCatalog.mproveDir
    };

    return payload;
  }
}
