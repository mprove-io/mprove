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
import { merge } from '~disk/models/git/merge';
import { pushToRemote } from '~disk/models/git/push-to-remote';

@Injectable()
export class PushRepoService {
  constructor(
    private cs: ConfigService<Config>,
    private logger: Logger
  ) {}

  async process(request: any) {
    let orgPath = this.cs.get<Config['diskOrganizationsPath']>(
      'diskOrganizationsPath'
    );

    let requestValid = nodeCommon.transformValidSync({
      classType: apiToDisk.ToDiskPushRepoRequest,
      object: request,
      errorMessage: common.ErEnum.DISK_WRONG_REQUEST_PARAMS,
      logIsJson: this.cs.get<Config['diskLogIsJson']>('diskLogIsJson'),
      logger: this.logger
    });

    let {
      orgId,
      projectId,
      repoId,
      branch,
      userAlias,
      remoteType,
      gitUrl,
      privateKey,
      publicKey
    } = requestValid.payload;

    let orgDir = `${orgPath}/${orgId}`;
    let projectDir = `${orgDir}/${projectId}`;
    let repoDir = `${projectDir}/${repoId}`;

    let prodRepoDir = `${projectDir}/${common.PROD_REPO_ID}`;

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

    let isBranchExist = await isLocalBranchExist({
      repoDir: repoDir,
      localBranch: branch
    });
    if (isBranchExist === false) {
      throw new common.ServerError({
        message: common.ErEnum.DISK_BRANCH_IS_NOT_EXIST
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
      branchName: branch,
      fetchOptions: fetchOptions,
      isFetch: true
    });

    //

    await pushToRemote({
      projectId: projectId,
      projectDir: projectDir,
      repoId: repoId,
      repoDir: repoDir,
      branch: branch,
      fetchOptions: fetchOptions
    });

    let isProdBranchExist = await isLocalBranchExist({
      repoDir: prodRepoDir,
      localBranch: branch
    });
    if (isProdBranchExist === false) {
      await createBranch({
        repoDir: prodRepoDir,
        fromBranch: `origin/${branch}`,
        newBranch: branch,
        fetchOptions: fetchOptions
      });
    }

    await merge({
      projectId: projectId,
      projectDir: projectDir,
      repoId: common.PROD_REPO_ID,
      repoDir: prodRepoDir,
      userAlias: userAlias,
      branch: branch,
      theirBranch: `origin/${branch}`,
      isTheirBranchRemote: true,
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

    let repoItemCatalog = <ItemCatalog>await getNodesAndFiles({
      projectId: projectId,
      projectDir: projectDir,
      repoId: repoId,
      readFiles: false,
      isRootMproveDir: false
    });

    let productionItemCatalog = <ItemCatalog>await getNodesAndFiles({
      projectId: projectId,
      projectDir: projectDir,
      repoId: common.PROD_REPO_ID,
      readFiles: true,
      isRootMproveDir: false
    });

    let payload: apiToDisk.ToDiskPushRepoResponsePayload = {
      repo: {
        orgId: orgId,
        projectId: projectId,
        repoId: repoId,
        repoStatus: repoStatus,
        currentBranchId: currentBranch,
        conflicts: conflicts,
        nodes: repoItemCatalog.nodes,
        changesToCommit: changesToCommit,
        changesToPush: changesToPush
      },
      productionFiles: productionItemCatalog.files,
      productionMproveDir: productionItemCatalog.mproveDir
    };

    return payload;
  }
}
