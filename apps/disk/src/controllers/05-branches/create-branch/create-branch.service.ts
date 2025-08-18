import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { apiToDisk } from '~disk/barrels/api-to-disk';
import { common } from '~disk/barrels/common';
import { nodeCommon } from '~disk/barrels/node-common';
import { makeFetchOptions } from '~disk/functions/make-fetch-options';
import { Config } from '~disk/interfaces/config';
import { ItemCatalog } from '~disk/interfaces/item-catalog';
import { ItemStatus } from '~disk/interfaces/item-status';
import { ensureDir } from '~disk/models/disk/ensure-dir';
import { getNodesAndFiles } from '~disk/models/disk/get-nodes-and-files';
import { isPathExist } from '~disk/models/disk/is-path-exist';
import { checkoutBranch } from '~disk/models/git/checkout-branch';
import { createBranch } from '~disk/models/git/create-branch';
import { getRepoStatus } from '~disk/models/git/get-repo-status';
import { isLocalBranchExist } from '~disk/models/git/is-local-branch-exist';
import { isRemoteBranchExist } from '~disk/models/git/is-remote-branch-exist';

@Injectable()
export class CreateBranchService {
  constructor(
    private cs: ConfigService<Config>,
    private logger: Logger
  ) {}

  async process(request: any) {
    let orgPath = this.cs.get<Config['diskOrganizationsPath']>(
      'diskOrganizationsPath'
    );

    let requestValid = nodeCommon.transformValidSync({
      classType: apiToDisk.ToDiskCreateBranchRequest,
      object: request,
      errorMessage: common.ErEnum.DISK_WRONG_REQUEST_PARAMS,
      logIsJson: this.cs.get<Config['diskLogIsJson']>('diskLogIsJson'),
      logger: this.logger
    });

    let { traceId } = requestValid.info;
    let {
      orgId,
      projectId,
      repoId,
      newBranch,
      fromBranch,
      isFromRemote,
      remoteType,
      gitUrl,
      privateKey,
      publicKey
    } = requestValid.payload;

    let orgDir = `${orgPath}/${orgId}`;
    let projectDir = `${orgDir}/${projectId}`;
    let repoDir = `${projectDir}/${repoId}`;

    //

    let isOrgExist = await isPathExist(orgDir);
    if (isOrgExist === false) {
      throw new common.ServerError({
        message: common.ErEnum.DISK_ORG_IS_NOT_EXIST
      });
    }

    let isProjectExist = await isPathExist(projectDir);
    if (isProjectExist === false) {
      throw new common.ServerError({
        message: common.ErEnum.DISK_PROJECT_IS_NOT_EXIST
      });
    }

    let isRepoExist = await isPathExist(repoDir);
    if (isRepoExist === false) {
      throw new common.ServerError({
        message: common.ErEnum.DISK_REPO_IS_NOT_EXIST
      });
    }

    let isNewBranchExist = await isLocalBranchExist({
      repoDir: repoDir,
      localBranch: newBranch
    });
    if (isNewBranchExist === true) {
      throw new common.ServerError({
        message: common.ErEnum.DISK_BRANCH_ALREADY_EXIST
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

    let isFromBranchExist =
      isFromRemote === true
        ? await isRemoteBranchExist({
            repoDir: repoDir,
            remoteBranch: fromBranch,
            fetchOptions: fetchOptions
          })
        : await isLocalBranchExist({
            repoDir: repoDir,
            localBranch: fromBranch
          });
    if (isFromBranchExist === false) {
      throw new common.ServerError({
        message: common.ErEnum.DISK_BRANCH_IS_NOT_EXIST
      });
    }

    await checkoutBranch({
      projectId: projectId,
      projectDir: projectDir,
      repoId: repoId,
      repoDir: repoDir,
      branchName: fromBranch,
      fetchOptions: fetchOptions,
      isFetch: true
    });

    //

    await createBranch({
      repoDir: repoDir,
      fromBranch: isFromRemote === true ? `origin/${fromBranch}` : fromBranch,
      newBranch: newBranch,
      fetchOptions: fetchOptions
    });

    let {
      repoStatus,
      currentBranch,
      conflicts,
      changesToCommit,
      changesToPush
    } = <ItemStatus>await getRepoStatus({
      projectId: projectId,
      projectDir: projectDir,
      repoId: repoId,
      repoDir: repoDir,
      fetchOptions: fetchOptions,
      isFetch: true,
      isCheckConflicts: true
    });

    let itemCatalog = <ItemCatalog>await getNodesAndFiles({
      projectId: projectId,
      projectDir: projectDir,
      repoId: repoId,
      readFiles: true,
      isRootMproveDir: false
    });

    let payload: apiToDisk.ToDiskCreateBranchResponsePayload = {
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
