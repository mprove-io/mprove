import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { apiToDisk } from '~disk/barrels/api-to-disk';
import { common } from '~disk/barrels/common';
import { disk } from '~disk/barrels/disk';
import { git } from '~disk/barrels/git';
import { interfaces } from '~disk/barrels/interfaces';
import { nodeCommon } from '~disk/barrels/node-common';
import { makeFetchOptions } from '~disk/functions/make-fetch-options';

@Injectable()
export class PushRepoService {
  constructor(
    private cs: ConfigService<interfaces.Config>,
    private logger: Logger
  ) {}

  async process(request: any) {
    let orgPath = this.cs.get<interfaces.Config['diskOrganizationsPath']>(
      'diskOrganizationsPath'
    );

    let requestValid = nodeCommon.transformValidSync({
      classType: apiToDisk.ToDiskPushRepoRequest,
      object: request,
      errorMessage: common.ErEnum.DISK_WRONG_REQUEST_PARAMS,
      logIsJson:
        this.cs.get<interfaces.Config['diskLogIsJson']>('diskLogIsJson'),
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

    let isOrgExist = await disk.isPathExist(orgDir);
    if (isOrgExist === false) {
      throw new common.ServerError({
        message: common.ErEnum.DISK_ORG_IS_NOT_EXIST
      });
    }

    let isProjectExist = await disk.isPathExist(projectDir);
    if (isProjectExist === false) {
      throw new common.ServerError({
        message: common.ErEnum.DISK_PROJECT_IS_NOT_EXIST
      });
    }

    let isRepoExist = await disk.isPathExist(repoDir);
    if (isRepoExist === false) {
      throw new common.ServerError({
        message: common.ErEnum.DISK_REPO_IS_NOT_EXIST
      });
    }

    let isBranchExist = await git.isLocalBranchExist({
      repoDir: repoDir,
      localBranch: branch
    });
    if (isBranchExist === false) {
      throw new common.ServerError({
        message: common.ErEnum.DISK_BRANCH_IS_NOT_EXIST
      });
    }

    let keyDir = `${orgDir}/_keys/${projectId}`;

    await disk.ensureDir(keyDir);

    let fetchOptions = makeFetchOptions({
      remoteType: remoteType,
      keyDir: keyDir,
      gitUrl: gitUrl,
      privateKey: privateKey,
      publicKey: publicKey
    });

    await git.checkoutBranch({
      projectId: projectId,
      projectDir: projectDir,
      repoId: repoId,
      repoDir: repoDir,
      branchName: branch,
      fetchOptions: fetchOptions,
      isFetch: true
    });

    //

    await git.pushToRemote({
      projectId: projectId,
      projectDir: projectDir,
      repoId: repoId,
      repoDir: repoDir,
      branch: branch,
      fetchOptions: fetchOptions
    });

    let isProdBranchExist = await git.isLocalBranchExist({
      repoDir: prodRepoDir,
      localBranch: branch
    });
    if (isProdBranchExist === false) {
      await git.createBranch({
        repoDir: prodRepoDir,
        fromBranch: `origin/${branch}`,
        newBranch: branch,
        fetchOptions: fetchOptions
      });
    }

    await git.merge({
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
    } = <interfaces.ItemStatus>await git.getRepoStatus({
      projectId: projectId,
      projectDir: projectDir,
      repoId: repoId,
      repoDir: repoDir,
      fetchOptions: fetchOptions,
      isFetch: true,
      isCheckConflicts: true
    });

    let repoItemCatalog = <interfaces.ItemCatalog>await disk.getNodesAndFiles({
      projectId: projectId,
      projectDir: projectDir,
      repoId: repoId,
      readFiles: false,
      isRootMproveDir: false
    });

    let productionItemCatalog = <interfaces.ItemCatalog>(
      await disk.getNodesAndFiles({
        projectId: projectId,
        projectDir: projectDir,
        repoId: common.PROD_REPO_ID,
        readFiles: true,
        isRootMproveDir: false
      })
    );

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
