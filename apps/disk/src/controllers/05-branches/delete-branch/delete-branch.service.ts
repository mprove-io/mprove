import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PROD_REPO_ID } from '~common/constants/top';
import { ErEnum } from '~common/enums/er.enum';
import { ProjectLt } from '~common/interfaces/backend/project-tab';
import { DiskItemCatalog } from '~common/interfaces/disk/disk-item-catalog';
import { DiskItemStatus } from '~common/interfaces/disk/disk-item-status';
import {
  ToDiskDeleteBranchRequest,
  ToDiskDeleteBranchResponsePayload
} from '~common/interfaces/to-disk/05-branches/to-disk-delete-branch';
import { ServerError } from '~common/models/server-error';
import { DiskConfig } from '~disk/config/disk-config';
import { ensureDir } from '~disk/functions/disk/ensure-dir';
import { getNodesAndFiles } from '~disk/functions/disk/get-nodes-and-files';
import { isPathExist } from '~disk/functions/disk/is-path-exist';
import { checkoutBranch } from '~disk/functions/git/checkout-branch';
import { deleteLocalBranch } from '~disk/functions/git/delete-local-branch';
import { deleteRemoteBranch } from '~disk/functions/git/delete-remote-branch';
import { getRepoStatus } from '~disk/functions/git/get-repo-status';
import { isLocalBranchExist } from '~disk/functions/git/is-local-branch-exist';
import { isRemoteBranchExist } from '~disk/functions/git/is-remote-branch-exist';
import { makeFetchOptions } from '~disk/functions/make-fetch-options';
import { decryptData } from '~node-common/functions/tab/decrypt-data';
import { transformValidSync } from '~node-common/functions/transform-valid-sync';

@Injectable()
export class DeleteBranchService {
  constructor(
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

    let projectTab: ProjectLt = decryptData<ProjectLt>({
      encryptedString: baseProject.tab,
      keyBase64: this.cs.get<DiskConfig['aesKey']>('aesKey')
    });

    let { projectId, remoteType } = baseProject;
    let {
      name: projectName,
      gitUrl,
      defaultBranch,
      privateKey,
      publicKey
    } = projectTab;

    let orgDir = `${orgPath}/${orgId}`;
    let projectDir = `${orgDir}/${projectId}`;
    let repoDir = `${projectDir}/${repoId}`;

    //

    let isOrgExist = await isPathExist(orgDir);
    if (isOrgExist === false) {
      throw new ServerError({
        message: ErEnum.DISK_ORG_IS_NOT_EXIST
      });
    }

    let isProjectExist = await isPathExist(projectDir);
    if (isProjectExist === false) {
      throw new ServerError({
        message: ErEnum.DISK_PROJECT_IS_NOT_EXIST
      });
    }

    let isRepoExist = await isPathExist(repoDir);
    if (isRepoExist === false) {
      throw new ServerError({
        message: ErEnum.DISK_REPO_IS_NOT_EXIST
      });
    }

    if (branch === defaultBranch) {
      throw new ServerError({
        message: ErEnum.DISK_DEFAULT_BRANCH_CANNOT_BE_DELETED
      });
    }

    let keyDir = `${orgDir}/_keys/${projectId}`;

    await ensureDir(keyDir);

    let fetchOptions = makeFetchOptions({
      remoteType: remoteType,
      keyDir: keyDir,
      gitUrl: gitUrl,
      privateKey: privateKey,
      publicKey: publicKey
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
