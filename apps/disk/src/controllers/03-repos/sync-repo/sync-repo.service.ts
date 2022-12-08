import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodegit from 'nodegit';
import { forEachSeries } from 'p-iteration';
import { apiToDisk } from '~disk/barrels/api-to-disk';
import { common } from '~disk/barrels/common';
import { disk } from '~disk/barrels/disk';
import { git } from '~disk/barrels/git';
import { interfaces } from '~disk/barrels/interfaces';
import { nodeCommon } from '~disk/barrels/node-common';
import { makeFetchOptions } from '~disk/functions/make-fetch-options';

@Injectable()
export class SyncRepoService {
  constructor(
    private cs: ConfigService<interfaces.Config>,
    private logger: Logger
  ) {}

  async process(request: any) {
    let requestValid = nodeCommon.transformValidSync({
      classType: apiToDisk.ToDiskSyncRepoRequest,
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
      lastCommit,
      localChangedFiles,
      localDeletedFiles,
      userAlias,
      remoteType,
      gitUrl,
      privateKey,
      publicKey
    } = requestValid.payload;

    let orgPath = this.cs.get<interfaces.Config['diskOrganizationsPath']>(
      'diskOrganizationsPath'
    );

    let orgDir = `${orgPath}/${orgId}`;
    let keyDir = `${orgDir}/_keys/${projectId}`;
    let projectDir = `${orgDir}/${projectId}`;
    let repoDir = `${projectDir}/${repoId}`;

    await disk.ensureDir(keyDir);

    let fetchOptions = makeFetchOptions({
      remoteType: remoteType,
      keyDir: keyDir,
      gitUrl: gitUrl,
      privateKey: privateKey,
      publicKey: publicKey
    });

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

    await git.checkoutBranch({
      projectId: projectId,
      projectDir: projectDir,
      repoId: repoId,
      repoDir: repoDir,
      branchName: branch,
      fetchOptions: fetchOptions,
      isFetch: false
    });

    let gitRepo = <nodegit.Repository>await nodegit.Repository.open(repoDir);

    let head: nodegit.Commit = await gitRepo.getHeadCommit();
    let headOid = head.id();
    let diskLastCommit = headOid.tostrS();

    if (lastCommit !== diskLastCommit) {
      throw new common.ServerError({
        message: common.ErEnum.DISK_DEV_REPO_COMMIT_DOES_NOT_MATCH_LOCAL_COMMIT,
        data: {
          branch: branch,
          devLastCommit: diskLastCommit,
          localLastCommit: lastCommit
        }
      });
    }

    let statusFiles: nodegit.StatusFile[] = await gitRepo.getStatus();

    let { changedFiles, deletedFiles } = await nodeCommon.getSyncFiles({
      repoDir: repoDir,
      statusFiles: statusFiles
    });

    let devChangedFiles = changedFiles;
    let devDeletedFiles = deletedFiles;

    let restChangedFiles: common.DiskSyncFile[] = devChangedFiles.filter(
      x =>
        [...localChangedFiles, ...localDeletedFiles]
          .map(f => f.path)
          .indexOf(x.path) < -1
    );

    let restDeletedFiles: common.DiskSyncFile[] = devDeletedFiles.filter(
      x =>
        [...localChangedFiles, ...localDeletedFiles]
          .map(f => f.path)
          .indexOf(x.path) < -1
    );

    await forEachSeries(localDeletedFiles, async (x: common.DiskSyncFile) => {
      let filePath = `${repoDir}/${x.path}`;

      let isFileExist = await disk.isPathExist(filePath);
      if (isFileExist === true) {
        await disk.removePath(filePath);
      }
    });

    await forEachSeries(localChangedFiles, async (x: common.DiskSyncFile) => {
      let filePath = `${repoDir}/${x.path}`;

      let isFileExist = await disk.isPathExist(filePath);
      if (isFileExist === false) {
        let parentPath = filePath.split('/').slice(0, -1).join('/');
        await disk.ensureDir(parentPath);
      }

      await disk.writeToFile({
        filePath: filePath,
        content: x.content
      });
    });

    //

    await git.addChangesToStage({ repoDir: repoDir });

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

    let itemCatalog = <interfaces.ItemCatalog>await disk.getNodesAndFiles({
      projectId: projectId,
      projectDir: projectDir,
      repoId: repoId,
      readFiles: true,
      isRootMproveDir: false
    });

    let payload: apiToDisk.ToDiskSyncRepoResponsePayload = {
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
      restChangedFiles: restChangedFiles,
      restDeletedFiles: restDeletedFiles,
      mproveDir: itemCatalog.mproveDir
    };

    return payload;
  }
}
