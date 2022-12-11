import { Command, Option } from 'clipanion';
import * as fse from 'fs-extra';
import * as nodegit from 'nodegit';
import { forEachSeries } from 'p-iteration';
import { apiToBackend } from '~mcli/barrels/api-to-backend';
import { common } from '~mcli/barrels/common';
import { nodeCommon } from '~mcli/barrels/node-common';
import { getConfig } from '~mcli/config/get.config';
import { logToConsoleMcli } from '~mcli/functions/log-to-console-mcli';
import { mreq } from '~mcli/functions/mreq';
import { CustomCommand } from '~mcli/models/custom-command';

interface Sync {
  syncTime: number;
  isFirstSync: boolean;
}

export class SyncRepoCommand extends CustomCommand {
  static paths = [['sync', 'repo']];

  static usage = Command.Usage({
    description: 'Synchronize files between Local and Dev repository',
    examples: [
      [
        'Synchronize files between Local and Dev repository',
        'sync repo --projectId DXYE72ODCP5LWPWH2EXQ --env prod'
      ]
    ]
  });

  dir = Option.String('-d,--dir', {
    description: '(optional) Absolute path of local git repository'
  });

  projectId = Option.String('-p,--projectId', {
    required: true,
    description: '(required) Project Id'
  });

  envId = Option.String('-e,--env', {
    required: true,
    description: '(required) Environment'
  });

  json = Option.Boolean('-j,--json', false, {
    description: '(default false)'
  });

  async execute() {
    if (common.isUndefined(this.context.config)) {
      this.context.config = getConfig();
    }

    let repoDir = common.isDefined(this.dir) ? this.dir : process.cwd();

    let gitRepo = <nodegit.Repository>await nodegit.Repository.open(repoDir);

    let currentBranchRef = await gitRepo.getCurrentBranch();
    let currentBranchName = await nodegit.Branch.name(currentBranchRef);

    let head: nodegit.Commit = await gitRepo.getHeadCommit();

    let headOid = head.id();
    let lastCommit = headOid.tostrS();

    let statusFiles: nodegit.StatusFile[] = await gitRepo.getStatus();

    let syncParentPath = `${repoDir}/${common.MPROVE_CACHE_DIR}`;
    let syncFilePath = `${syncParentPath}/${common.MPROVE_SYNC_FILENAME}`;

    let isSyncFileExist = await fse.pathExists(syncFilePath);

    let syncFileContent;
    if (isSyncFileExist === true) {
      let { content } = await nodeCommon.readFileCheckSize({
        filePath: syncFilePath,
        getStat: false
      });
      syncFileContent = content;
    }

    let syncFile: Sync = isSyncFileExist
      ? JSON.parse(syncFileContent)
      : undefined;

    let lastSyncTime = common.isDefined(syncFile?.syncTime)
      ? Number(syncFile.syncTime)
      : 0;

    let { changedFiles, deletedFiles } = await nodeCommon.getSyncFiles({
      repoDir: repoDir,
      statusFiles: statusFiles,
      lastSyncTime: lastSyncTime
    });

    let localChangedFiles = changedFiles;
    let localDeletedFiles = deletedFiles;

    let loginUserReqPayload: apiToBackend.ToBackendLoginUserRequestPayload = {
      email: this.context.config.mproveCliEmail,
      password: this.context.config.mproveCliPassword
    };

    let loginUserResp = await mreq<apiToBackend.ToBackendLoginUserResponse>({
      pathInfoName:
        apiToBackend.ToBackendRequestInfoNameEnum.ToBackendLoginUser,
      payload: loginUserReqPayload,
      config: this.context.config
    });

    let localReqSentTime = Date.now();

    let syncRepoReqPayload: apiToBackend.ToBackendSyncRepoRequestPayload = {
      projectId: this.projectId,
      branchId: currentBranchName,
      envId: this.envId,
      lastCommit: lastCommit,
      lastSyncTime: lastSyncTime,
      localChangedFiles: localChangedFiles,
      localDeletedFiles: localDeletedFiles
    };

    let syncRepoResp = await mreq<apiToBackend.ToBackendSyncRepoResponse>({
      token: loginUserResp.payload.token,
      pathInfoName: apiToBackend.ToBackendRequestInfoNameEnum.ToBackendSyncRepo,
      payload: syncRepoReqPayload,
      config: this.context.config
    });

    let localRespReceiveTime = Date.now();

    await forEachSeries(
      syncRepoResp.payload.restDeletedFiles,
      async (x: common.DiskSyncFile) => {
        let filePath = `${repoDir}/${x.path}`;

        let isFileExist = await fse.pathExists(filePath);
        if (isFileExist === true) {
          await fse.remove(filePath);
        }
      }
    );

    await forEachSeries(
      syncRepoResp.payload.restChangedFiles,
      async (x: common.DiskSyncFile) => {
        let filePath = `${repoDir}/${x.path}`;

        let isFileExist = await fse.pathExists(filePath);
        if (isFileExist === false) {
          let parentPath = filePath.split('/').slice(0, -1).join('/');
          await fse.ensureDir(parentPath);
        }

        await fse.writeFile(filePath, x.content);
      }
    );

    //

    await fse.ensureDir(syncParentPath);

    let sync: Sync = {
      syncTime: Date.now(),
      isFirstSync: lastSyncTime === 0
    };

    let syncJson = JSON.stringify(sync, null, 2);
    await fse.writeFile(syncFilePath, syncJson);

    logToConsoleMcli({
      log: {
        errors: syncRepoResp.payload.struct.errors,
        syncTime: sync.syncTime,
        reqTimeDiff: syncRepoResp.payload.devReqReceiveTime - localReqSentTime,
        respTimeDiff:
          localRespReceiveTime - syncRepoResp.payload.devRespSentTime
      },
      logLevel: common.LogLevelEnum.Info,
      context: this.context,
      isJson: this.json
    });
  }
}
