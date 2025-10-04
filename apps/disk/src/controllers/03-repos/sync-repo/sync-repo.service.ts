import * as nodegit from '@figma/nodegit';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { forEachSeries } from 'p-iteration';
import { ErEnum } from '~common/enums/er.enum';
import { FileStatusEnum } from '~common/enums/file-status.enum';
import { isDefined } from '~common/functions/is-defined';
import { isUndefined } from '~common/functions/is-undefined';
import { DiskItemCatalog } from '~common/interfaces/disk/disk-item-catalog';
import { DiskItemStatus } from '~common/interfaces/disk/disk-item-status';
import { DiskSyncFile } from '~common/interfaces/disk/disk-sync-file';
import {
  ToDiskSyncRepoRequest,
  ToDiskSyncRepoResponsePayload
} from '~common/interfaces/to-disk/03-repos/to-disk-sync-repo';
import { ServerError } from '~common/models/server-error';
import { DiskConfig } from '~disk/config/disk-config';
import { ensureDir } from '~disk/functions/disk/ensure-dir';
import { getNodesAndFiles } from '~disk/functions/disk/get-nodes-and-files';
import { isPathExist } from '~disk/functions/disk/is-path-exist';
import { removePath } from '~disk/functions/disk/remove-path';
import { writeToFile } from '~disk/functions/disk/write-to-file';
import { addChangesToStage } from '~disk/functions/git/add-changes-to-stage';
import { checkoutBranch } from '~disk/functions/git/checkout-branch';
import { getRepoStatus } from '~disk/functions/git/get-repo-status';
import { isLocalBranchExist } from '~disk/functions/git/is-local-branch-exist';
import { makeFetchOptions } from '~disk/functions/make-fetch-options';
import { getSyncFiles } from '~node-common/functions/get-sync-files';
import { transformValidSync } from '~node-common/functions/transform-valid-sync';

@Injectable()
export class SyncRepoService {
  constructor(
    private cs: ConfigService<DiskConfig>,
    private logger: Logger
  ) {}

  async process(request: any) {
    let devReqReceiveTime = Date.now();

    let requestValid = transformValidSync({
      classType: ToDiskSyncRepoRequest,
      object: request,
      errorMessage: ErEnum.DISK_WRONG_REQUEST_PARAMS,
      logIsJson: this.cs.get<DiskConfig['diskLogIsJson']>('diskLogIsJson'),
      logger: this.logger
    });

    let {
      orgId,
      project,
      repoId,
      branch,
      lastCommit,
      lastSyncTime,
      localChangedFiles,
      localDeletedFiles
    } = requestValid.payload;

    let { projectId, remoteType, gitUrl } = project;

    let orgPath = this.cs.get<DiskConfig['diskOrganizationsPath']>(
      'diskOrganizationsPath'
    );

    let orgDir = `${orgPath}/${orgId}`;
    let keyDir = `${orgDir}/_keys/${projectId}`;
    let projectDir = `${orgDir}/${projectId}`;
    let repoDir = `${projectDir}/${repoId}`;

    await ensureDir(keyDir);

    let fetchOptions = makeFetchOptions({
      remoteType: remoteType,
      keyDir: keyDir,
      gitUrl: gitUrl,
      privateKey: project.tab.privateKey,
      publicKey: project.tab.publicKey
    });

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

    let isBranchExist = await isLocalBranchExist({
      repoDir: repoDir,
      localBranch: branch
    });
    if (isBranchExist === false) {
      throw new ServerError({
        message: ErEnum.DISK_BRANCH_IS_NOT_EXIST
      });
    }

    await checkoutBranch({
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
      throw new ServerError({
        message: ErEnum.DISK_DEV_REPO_COMMIT_DOES_NOT_MATCH_LOCAL_COMMIT,
        displayData: {
          branch: branch,
          devLastCommit: diskLastCommit,
          localLastCommit: lastCommit
        }
      });
    }

    let statusFiles: nodegit.StatusFile[] = await gitRepo.getStatus();

    let { changedFiles, deletedFiles } = await getSyncFiles({
      repoDir: repoDir,
      statusFiles: statusFiles,
      lastSyncTime: lastSyncTime
    });

    let devChangedFiles = changedFiles;
    let devDeletedFiles = deletedFiles;

    let restChangedFiles: DiskSyncFile[] = devChangedFiles.filter(
      devChangedFile => {
        let localDeletedFile = localDeletedFiles.find(
          x => x.path === devChangedFile.path
        );

        let localChangedFile = localChangedFiles.find(
          x => x.path === devChangedFile.path
        );

        if (
          isDefined(localChangedFile) &&
          localChangedFile.modifiedTime > devChangedFile.modifiedTime
        ) {
          return false;
        }

        if (
          isUndefined(localChangedFile) &&
          lastSyncTime > 0 &&
          devChangedFile.modifiedTime < lastSyncTime &&
          devChangedFile.status === FileStatusEnum.New
        ) {
          return false;
        }

        if (
          isDefined(localDeletedFile) &&
          lastSyncTime > 0 &&
          devChangedFile.modifiedTime < lastSyncTime
        ) {
          return false;
        }

        return true;
      }
    );

    let restDeletedFiles: DiskSyncFile[] = devDeletedFiles.filter(
      devDeletedFile => {
        let localDeletedFile = localDeletedFiles.find(
          x => x.path === devDeletedFile.path
        );

        let localChangedFile = localChangedFiles.find(
          x => x.path === devDeletedFile.path
        );

        if (isDefined(localDeletedFile)) {
          return false;
        }

        if (lastSyncTime === 0 && isDefined(localChangedFile)) {
          return false;
        }

        if (
          lastSyncTime > 0 &&
          isDefined(localChangedFile) &&
          localChangedFile.modifiedTime > lastSyncTime
        ) {
          return false;
        }

        return true;
      }
    );

    await forEachSeries(
      devChangedFiles,
      async (devChangedFile: DiskSyncFile) => {
        let filePath = `${repoDir}/${devChangedFile.path}`;

        let localChangedFile = localChangedFiles.find(
          x => x.path === devChangedFile.path
        );

        if (
          lastSyncTime > 0 &&
          devChangedFile.modifiedTime < lastSyncTime &&
          isUndefined(localChangedFile) &&
          devChangedFile.status === FileStatusEnum.New
        ) {
          await deleteFile(filePath);
        }
      }
    );

    await forEachSeries(
      localDeletedFiles,
      async (localDeletedFile: DiskSyncFile) => {
        let filePath = `${repoDir}/${localDeletedFile.path}`;

        let devChangedFile = devChangedFiles.find(
          x => x.path === localDeletedFile.path
        );

        if (lastSyncTime === 0 && isDefined(devChangedFile)) {
          return;
        }

        if (
          lastSyncTime > 0 &&
          isDefined(devChangedFile) &&
          devChangedFile.modifiedTime > lastSyncTime
        ) {
          return;
        }

        await deleteFile(filePath);
      }
    );

    await forEachSeries(
      localChangedFiles,
      async (localChangedFile: DiskSyncFile) => {
        let devDeletedFile = devDeletedFiles.find(
          x => x.path === localChangedFile.path
        );

        let devChangedFile = devChangedFiles.find(
          x => x.path === localChangedFile.path
        );

        if (
          lastSyncTime > 0 &&
          localChangedFile.modifiedTime < lastSyncTime &&
          isUndefined(devChangedFile) &&
          localChangedFile.status === FileStatusEnum.New
        ) {
          let restDeletedFile = restDeletedFiles.find(
            f => f.path === localChangedFile.path
          );

          if (isUndefined(restDeletedFile)) {
            let file: DiskSyncFile = {
              path: localChangedFile.path,
              status: undefined,
              content: undefined,
              modifiedTime: undefined
            };

            restDeletedFiles.push(file);
          }

          return;
        }

        if (
          lastSyncTime > 0 &&
          localChangedFile.modifiedTime < lastSyncTime &&
          isDefined(devDeletedFile)
        ) {
          return;
        }

        if (
          isUndefined(devChangedFile) ||
          localChangedFile.modifiedTime > devChangedFile.modifiedTime
        ) {
          let filePath = `${repoDir}/${localChangedFile.path}`;

          let isFileExist = await isPathExist(filePath);
          if (isFileExist === false) {
            let parentPath = filePath.split('/').slice(0, -1).join('/');
            await ensureDir(parentPath);
          }

          await writeToFile({
            filePath: filePath,
            content: localChangedFile.content
          });
        }
      }
    );

    await addChangesToStage({ repoDir: repoDir });

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
      isCheckConflicts: true,
      addContent: true
    });

    let itemCatalog = <DiskItemCatalog>await getNodesAndFiles({
      projectId: projectId,
      projectDir: projectDir,
      repoId: repoId,
      readFiles: true,
      isRootMproveDir: false
    });

    let devRespSentTime = Date.now();

    let payload: ToDiskSyncRepoResponsePayload = {
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
      mproveDir: itemCatalog.mproveDir,
      devReqReceiveTime: devReqReceiveTime,
      devRespSentTime: devRespSentTime
    };

    return payload;
  }
}

async function deleteFile(filePath: string) {
  let isFileExist = await isPathExist(filePath);
  if (isFileExist === true) {
    await removePath(filePath);
  }
}
