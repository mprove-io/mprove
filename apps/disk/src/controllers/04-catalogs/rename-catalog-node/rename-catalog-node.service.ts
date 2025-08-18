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
import { renamePath } from '~disk/models/disk/rename-path';
import { addChangesToStage } from '~disk/models/git/add-changes-to-stage';
import { checkoutBranch } from '~disk/models/git/checkout-branch';
import { getRepoStatus } from '~disk/models/git/get-repo-status';
import { isLocalBranchExist } from '~disk/models/git/is-local-branch-exist';

@Injectable()
export class RenameCatalogNodeService {
  constructor(
    private cs: ConfigService<Config>,
    private logger: Logger
  ) {}

  async process(request: any) {
    let orgPath = this.cs.get<Config['diskOrganizationsPath']>(
      'diskOrganizationsPath'
    );

    let requestValid = nodeCommon.transformValidSync({
      classType: apiToDisk.ToDiskRenameCatalogNodeRequest,
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
      nodeId,
      newName,
      remoteType,
      gitUrl,
      privateKey,
      publicKey
    } = requestValid.payload;

    let orgDir = `${orgPath}/${orgId}`;
    let projectDir = `${orgDir}/${projectId}`;
    let repoDir = `${projectDir}/${repoId}`;

    let oldPath = repoDir + '/' + nodeId.substring(projectId.length + 1);
    let sourceArray = oldPath.split('/');
    sourceArray.pop();
    let parentPath = sourceArray.join('/');
    let newPath = parentPath + '/' + newName;

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
      isFetch: false
    });

    let isOldPathExist = await isPathExist(oldPath);
    if (isOldPathExist === false) {
      throw new common.ServerError({
        message: common.ErEnum.DISK_OLD_PATH_IS_NOT_EXIST
      });
    }

    //
    let isNewPathExist = await isPathExist(newPath);
    if (isNewPathExist === true) {
      throw new common.ServerError({
        message: common.ErEnum.DISK_NEW_PATH_ALREADY_EXIST
      });
    }
    await renamePath({
      oldPath: oldPath,
      newPath: newPath
    });

    await addChangesToStage({ repoDir: repoDir });

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

    let payload: apiToDisk.ToDiskRenameCatalogNodeResponsePayload = {
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
