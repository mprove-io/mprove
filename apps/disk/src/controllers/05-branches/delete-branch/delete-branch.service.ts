import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PROD_REPO_ID } from '~common/constants/top';
import { ErEnum } from '~common/enums/er.enum';
import { DiskItemCatalog } from '~common/interfaces/disk/disk-item-catalog';
import { DiskItemStatus } from '~common/interfaces/disk/disk-item-status';
import { ProjectLt, ProjectSt } from '~common/interfaces/st-lt';
import {
  ToDiskDeleteBranchRequest,
  ToDiskDeleteBranchResponsePayload
} from '~common/interfaces/to-disk/05-branches/to-disk-delete-branch';
import { ServerError } from '~common/models/server-error';
import { DiskConfig } from '~disk/config/disk-config';
import { getNodesAndFiles } from '~disk/functions/disk/get-nodes-and-files';
import { checkoutBranch } from '~disk/functions/git/checkout-branch';
import { deleteLocalBranch } from '~disk/functions/git/delete-local-branch';
import { deleteRemoteBranch } from '~disk/functions/git/delete-remote-branch';
import { getRepoStatus } from '~disk/functions/git/get-repo-status';
import { isLocalBranchExist } from '~disk/functions/git/is-local-branch-exist';
import { isRemoteBranchExist } from '~disk/functions/git/is-remote-branch-exist';
import { makeFetchOptions } from '~disk/functions/make-fetch-options';
import { DiskTabService } from '~disk/services/disk-tab.service';
import { RestoreService } from '~disk/services/restore.service';
import { transformValidSync } from '~node-common/functions/transform-valid-sync';

@Injectable()
export class DeleteBranchService {
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
      classType: ToDiskDeleteBranchRequest,
      object: request,
      errorMessage: ErEnum.DISK_WRONG_REQUEST_PARAMS,
      logIsJson: this.cs.get<DiskConfig['diskLogIsJson']>('diskLogIsJson'),
      logger: this.logger
    });

    let { orgId, baseProject, repoId, branch } = requestValid.payload;

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

    // let isRepoExist = await isPathExist(repoDir);
    // if (isRepoExist === false) {
    //   throw new ServerError({
    //     message: ErEnum.DISK_REPO_IS_NOT_EXIST
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

    if (branch === defaultBranch) {
      throw new ServerError({
        message: ErEnum.DISK_DEFAULT_BRANCH_CANNOT_BE_DELETED
      });
    }

    let fetchOptions = makeFetchOptions({
      remoteType: remoteType,
      keyDir: keyDir,
      gitUrl: gitUrl,
      privateKeyEncrypted: privateKeyEncrypted,
      publicKey: publicKey,
      passPhrase: passPhrase
    });

    await checkoutBranch({
      projectId: projectId,
      projectDir: projectDir,
      repoId: repoId,
      repoDir: repoDir,
      branchName: defaultBranch,
      fetchOptions: fetchOptions,
      isFetch: false
    });

    let errorIfNoLocalBranch = true;

    if (repoId === PROD_REPO_ID) {
      let isRemoteBranchExistResult = await isRemoteBranchExist({
        repoDir: repoDir,
        remoteBranch: branch,
        fetchOptions: fetchOptions
      });

      if (isRemoteBranchExistResult === true) {
        await deleteRemoteBranch({
          projectDir: projectDir,
          branch: branch,
          fetchOptions: fetchOptions
        });
        errorIfNoLocalBranch = false;
      }
    }

    let isLocalBranchExistResult = await isLocalBranchExist({
      repoDir: repoDir,
      localBranch: branch
    });

    if (isLocalBranchExistResult === true) {
      await deleteLocalBranch({
        repoDir: repoDir,
        branch: branch
      });
    } else if (errorIfNoLocalBranch === true) {
      throw new ServerError({
        message: ErEnum.DISK_BRANCH_IS_NOT_EXIST
      });
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
      readFiles: false,
      isRootMproveDir: false
    });

    let payload: ToDiskDeleteBranchResponsePayload = {
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
      deletedBranch: branch
    };

    return payload;
  }
}
