import { Command, Option } from 'clipanion';
import * as fse from 'fs-extra';
import * as nodegit from 'nodegit';
import { forEachSeries } from 'p-iteration';
import { apiToBackend } from '~mcli/barrels/api-to-backend';
import { common } from '~mcli/barrels/common';
import { constants } from '~mcli/barrels/constants';
import { interfaces } from '~mcli/barrels/interfaces';
import { nodeCommon } from '~mcli/barrels/node-common';
import { getConfig } from '~mcli/config/get.config';
import { getFilesUrl } from '~mcli/functions/get-files-url';
import { getLoginToken } from '~mcli/functions/get-login-token';
import { logToConsoleMcli } from '~mcli/functions/log-to-console-mcli';
import { makeSyncTime } from '~mcli/functions/make-sync-time';
import { mreq } from '~mcli/functions/mreq';
import { writeSyncConfig } from '~mcli/functions/write-sync-config';
import { CustomCommand } from '~mcli/models/custom-command';

let deepEqual = require('deep-equal');

export class SyncCommand extends CustomCommand {
  static paths = [['sync']];

  static usage = Command.Usage({
    description:
      'Synchronize files (uncommitted changes) between Local and Dev repo, validate BlockML for selected env',
    examples: [
      [
        'Synchronize files (uncommitted changes) between Local and Dev repo, validate BlockML for selected env',
        'mprove sync -p DXYE72ODCP5LWPWH2EXQ --env prod'
      ]
    ]
  });

  localPath = Option.String('--local-path', {
    description:
      '(optional, if not specified then the current working directory is used) Absolute path of local git repository'
  });

  projectId = Option.String('-p', {
    required: true,
    description: '(required) Project Id'
  });

  env = Option.String('--env', {
    required: true,
    description: '(required) Environment'
  });

  firstSync = Option.Boolean('--first-sync', false, {
    description:
      '(default false) if set, then the previous sync timestamp is ignored'
  });

  debug = Option.Boolean('--debug', false, {
    description: '(default false) add debug to output'
  });

  getNodes = Option.Boolean('--get-nodes', false, {
    description: '(default false), show repo nodes in output'
  });

  getErrors = Option.Boolean('--get-errors', false, {
    description: '(default false), show validation errors in output'
  });

  json = Option.Boolean('--json', false, {
    description: '(default false)'
  });

  async execute() {
    if (common.isUndefined(this.context.config)) {
      this.context.config = getConfig();
    }

    let repoDir = common.isDefined(this.localPath)
      ? this.localPath
      : process.cwd();

    let gitRepo = <nodegit.Repository>await nodegit.Repository.open(repoDir);

    let currentBranchRef = await gitRepo.getCurrentBranch();
    let currentBranchName = await nodegit.Branch.name(currentBranchRef);

    let head: nodegit.Commit = await gitRepo.getHeadCommit();

    let headOid = head.id();
    let lastCommit = headOid.tostrS();

    let statusFiles: nodegit.StatusFile[] = await gitRepo.getStatus();

    let syncParentPath = `${repoDir}/${common.MPROVE_CACHE_DIR}`;
    let syncFilePath = `${syncParentPath}/${common.MPROVE_SYNC_FILENAME}`;

    if (this.firstSync === true) {
      await fse.remove(syncFilePath);
    }

    let isSyncFileExist = await fse.pathExists(syncFilePath);

    let syncFileContent;
    if (isSyncFileExist === true) {
      let { content } = await nodeCommon.readFileCheckSize({
        filePath: syncFilePath,
        getStat: false
      });
      syncFileContent = content;
    }

    let syncFile: interfaces.SyncConfig = isSyncFileExist
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

    let loginToken = await getLoginToken(this.context);

    let localReqSentTime = Date.now();

    let syncRepoReqPayload: apiToBackend.ToBackendSyncRepoRequestPayload = {
      projectId: this.projectId,
      branchId: currentBranchName,
      envId: this.env,
      lastCommit: lastCommit,
      lastSyncTime: lastSyncTime,
      localChangedFiles: localChangedFiles,
      localDeletedFiles: localDeletedFiles
    };

    let syncRepoResp = await mreq<apiToBackend.ToBackendSyncRepoResponse>({
      loginToken: loginToken,
      pathInfoName: apiToBackend.ToBackendRequestInfoNameEnum.ToBackendSyncRepo,
      payload: syncRepoReqPayload,
      host: this.context.config.mproveCliHost
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

    let localChangesToCommit = await nodeCommon.getChangesToCommit({
      repoDir: repoDir,
      addContent: true
    });

    let devChangesToCommit = syncRepoResp.payload.repo.changesToCommit;

    let syncSuccess = deepEqual(localChangesToCommit, devChangesToCommit);

    if (syncSuccess === false) {
      logToConsoleMcli({
        log: {
          localChangesToCommit: localChangesToCommit,
          devChangesToCommit: devChangesToCommit
        },
        logLevel: common.LogLevelEnum.Info,
        context: this.context,
        isJson: this.json
      });

      let serverError = new common.ServerError({
        message: common.ErEnum.MCLI_SYNC_FAILED
      });
      throw serverError;
    }

    await common.sleep(constants.POSSIBLE_TIME_DIFF_MS);

    let syncTime = await makeSyncTime({ skipDelay: true });

    let syncConfig = await writeSyncConfig({
      repoPath: repoDir,
      syncTime: syncTime,
      lastSyncTime: lastSyncTime
    });

    let filesUrl = getFilesUrl({
      host: this.context.config.mproveCliHost,
      orgId: syncRepoResp.payload.repo.orgId,
      projectId: this.projectId,
      repoId: syncRepoResp.payload.repo.repoId,
      branch: currentBranchName,
      env: this.env
    });

    let repo = syncRepoResp.payload.repo;

    if (this.getNodes === false) {
      repo.nodes = undefined;
    }

    delete repo.changesToCommit;
    delete repo.changesToPush;

    let log: any = {
      syncSuccess: syncSuccess,
      url: filesUrl,
      needValidate: syncRepoResp.payload.needValidate,
      repo: repo,
      structId: syncRepoResp.payload.struct.structId,
      errorsTotal: syncRepoResp.payload.struct.errors.length
    };

    if (this.debug === true) {
      log.debug = {
        lastSyncTime: lastSyncTime,
        syncTime: syncConfig.syncTime,
        reqTimeDiff: syncRepoResp.payload.devReqReceiveTime - localReqSentTime,
        respTimeDiff:
          localRespReceiveTime - syncRepoResp.payload.devRespSentTime,
        localChangedFiles: localChangedFiles,
        localDeletedFiles: localDeletedFiles,
        restChangedFiles: syncRepoResp.payload.restChangedFiles,
        restDeletedFiles: syncRepoResp.payload.restDeletedFiles,
        localChangesToCommit: localChangesToCommit,
        devChangesToCommit: devChangesToCommit
      };
    }

    if (this.getErrors === true) {
      log.errors = syncRepoResp.payload.struct.errors;
    }

    logToConsoleMcli({
      log: log,
      logLevel: common.LogLevelEnum.Info,
      context: this.context,
      isJson: this.json
    });
  }
}
