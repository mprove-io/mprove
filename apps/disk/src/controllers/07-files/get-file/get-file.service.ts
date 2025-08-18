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
import { getBaseCommitFileContent } from '~disk/models/git/get-base-commit-file-content';
import { getLastCommitFileContent } from '~disk/models/git/get-last-commit-file-content';
import { getRepoStatus } from '~disk/models/git/get-repo-status';
import { isLocalBranchExist } from '~disk/models/git/is-local-branch-exist';

@Injectable()
export class GetFileService {
  constructor(
    private cs: ConfigService<Config>,
    private logger: Logger
  ) {}

  async process(request: any) {
    let orgPath = this.cs.get<Config['diskOrganizationsPath']>(
      'diskOrganizationsPath'
    );

    let requestValid = nodeCommon.transformValidSync({
      classType: apiToDisk.ToDiskGetFileRequest,
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
      fileNodeId,
      remoteType,
      gitUrl,
      privateKey,
      publicKey,
      panel
    } = requestValid.payload;

    let orgDir = `${orgPath}/${orgId}`;
    let projectDir = `${orgDir}/${projectId}`;
    let repoDir = `${projectDir}/${repoId}`;

    let filePathRelative = fileNodeId.substring(projectId.length + 1);

    let filePath = repoDir + '/' + filePathRelative;

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

    let content = '';

    let isExist = true;

    let isFileExist = await isPathExist(filePath);
    if (isFileExist === false) {
      isExist = false;
      if (panel === common.PanelEnum.Tree) {
        throw new common.ServerError({
          message: common.ErEnum.DISK_FILE_IS_NOT_EXIST
        });
      }
    } else {
      let { content: cont } = await nodeCommon.readFileCheckSize({
        filePath: filePath,
        getStat: false
      });

      content = cont;
    }

    let originalContent;

    if (panel === common.PanelEnum.ChangesToCommit) {
      originalContent = await getLastCommitFileContent({
        repoDir: repoDir,
        filePathRelative: filePathRelative
      });
    } else if (panel === common.PanelEnum.ChangesToPush) {
      originalContent = await getBaseCommitFileContent({
        repoDir: repoDir,
        filePathRelative: filePathRelative
      });
    }

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
      isFetch: false,
      isCheckConflicts: false
    });

    let itemCatalog = <ItemCatalog>await getNodesAndFiles({
      projectId: projectId,
      projectDir: projectDir,
      repoId: repoId,
      readFiles: true,
      isRootMproveDir: false
    });

    let payload: apiToDisk.ToDiskGetFileResponsePayload = {
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
      originalContent: originalContent,
      content: content,
      isExist: isExist
    };

    return payload;
  }
}
