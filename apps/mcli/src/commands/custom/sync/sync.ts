import * as nodegit from '@figma/nodegit';
import { Command, Option } from 'clipanion';
import * as fse from 'fs-extra';
import { forEachSeries } from 'p-iteration';
import { MPROVE_CACHE_DIR, MPROVE_SYNC_FILENAME } from '~common/constants/top';
import { POSSIBLE_TIME_DIFF_MS } from '~common/constants/top-mcli';
import { ErEnum } from '~common/enums/er.enum';
import { LogLevelEnum } from '~common/enums/log-level.enum';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import { isDefined } from '~common/functions/is-defined';
import { isUndefined } from '~common/functions/is-undefined';
import { sleep } from '~common/functions/sleep';
import { DiskSyncFile } from '~common/interfaces/disk/disk-sync-file';
import { McliSyncConfig } from '~common/interfaces/mcli/mcli-sync-config';
import {
  ToBackendSyncRepoRequestPayload,
  ToBackendSyncRepoResponse
} from '~common/interfaces/to-backend/repos/to-backend-sync-repo';
import { ServerError } from '~common/models/server-error';
import { getConfig } from '~mcli/config/get.config';
import { getFilesUrl } from '~mcli/functions/get-files-url';
import { getLoginToken } from '~mcli/functions/get-login-token';
import { logToConsoleMcli } from '~mcli/functions/log-to-console-mcli';
import { makeSyncTime } from '~mcli/functions/make-sync-time';
import { mreq } from '~mcli/functions/mreq';
import { writeSyncConfig } from '~mcli/functions/write-sync-config';
import { CustomCommand } from '~mcli/models/custom-command';
import { getChangesToCommit } from '~node-common/functions/get-changes-to-commit';
import { getSyncFiles } from '~node-common/functions/get-sync-files';
import { readFileCheckSize } from '~node-common/functions/read-file-check-size';

let deepEqual = require('fast-deep-equal');

export class SyncCommand extends CustomCommand {
  static paths = [['sync']];

  static usage = Command.Usage({
    description:
      'Synchronize files (uncommitted changes) between Local and Dev repo, validate Mprove Files for selected env',
    examples: [
      [
        'Synchronize files (uncommitted changes) between Local and Dev repo, validate Mprove Files for selected env',
        'mprove sync --project-id DXYE72ODCP5LWPWH2EXQ --env prod'
      ]
    ]
  });

  projectId = Option.String('--project-id', {
    description: '(required) Project Id'
  });

  env = Option.String('--env', {
    required: true,
    description: '(required) Environment'
  });

  localPath = Option.String('--local-path', {
    description:
      '(optional, if not specified then the current working directory is used) Absolute path of local git repository'
  });

  firstSync = Option.Boolean('--first-sync', false, {
    description:
      '(default false) if set, then the previous sync timestamp is ignored'
  });

  getRepo = Option.Boolean('--get-repo', false, {
    description: '(default false), show repo in output'
  });

  getRepoNodes = Option.Boolean('--get-repo-nodes', false, {
    description: '(default false), show repo nodes in output'
  });

  getErrors = Option.Boolean('--get-errors', false, {
    description: '(default false), show validation errors in output'
  });

  json = Option.Boolean('--json', false, {
    description: '(default false)'
  });

  debug = Option.Boolean('--debug', false, {
    description: '(default false) add debug to output'
  });

  envFilePath = Option.String('--env-file-path', {
    description: '(optional) Path to ".env" file'
  });

  async execute() {
    if (isUndefined(this.context.config)) {
      this.context.config = getConfig(this.envFilePath);
    }

    this.projectId = this.projectId || this.context.config.mproveCliProjectId;

    if (isUndefined(this.projectId)) {
      let serverError = new ServerError({
        message: ErEnum.MCLI_PROJECT_ID_IS_NOT_DEFINED,
        originalError: null
      });
      throw serverError;
    }

    let repoDir = isDefined(this.localPath) ? this.localPath : process.cwd();

    let gitRepo = <nodegit.Repository>await nodegit.Repository.open(repoDir);

    let currentBranchRef = await gitRepo.getCurrentBranch();
    let currentBranchName = await nodegit.Branch.name(currentBranchRef);

    let head: nodegit.Commit = await gitRepo.getHeadCommit();

    let headOid = head.id();
    let lastCommit = headOid.tostrS();

    let statusFiles: nodegit.StatusFile[] = await gitRepo.getStatus();

    let syncParentPath = `${repoDir}/${MPROVE_CACHE_DIR}`;
    let syncFilePath = `${syncParentPath}/${MPROVE_SYNC_FILENAME}`;

    if (this.firstSync === true) {
      await fse.remove(syncFilePath);
    }

    let isSyncFileExist = await fse.pathExists(syncFilePath);

    let syncFileContent;
    if (isSyncFileExist === true) {
      let { content } = await readFileCheckSize({
        filePath: syncFilePath,
        getStat: false
      });
      syncFileContent = content;
    }

    let syncConfig: McliSyncConfig = isSyncFileExist
      ? JSON.parse(syncFileContent)
      : undefined;

    let lastSyncTime = isDefined(syncConfig?.lastSyncTime)
      ? Number(syncConfig.lastSyncTime)
      : 0;

    let { changedFiles, deletedFiles } = await getSyncFiles({
      repoDir: repoDir,
      statusFiles: statusFiles,
      lastSyncTime: lastSyncTime
    });

    let localChangedFiles = changedFiles;
    let localDeletedFiles = deletedFiles;

    let loginToken = await getLoginToken(this.context);

    let localReqSentTime = Date.now();

    let syncRepoReqPayload: ToBackendSyncRepoRequestPayload = {
      projectId: this.projectId,
      branchId: currentBranchName,
      envId: this.env,
      lastCommit: lastCommit,
      lastSyncTime: lastSyncTime,
      localChangedFiles: localChangedFiles,
      localDeletedFiles: localDeletedFiles
    };

    let syncRepoResp = await mreq<ToBackendSyncRepoResponse>({
      loginToken: loginToken,
      pathInfoName: ToBackendRequestInfoNameEnum.ToBackendSyncRepo,
      payload: syncRepoReqPayload,
      host: this.context.config.mproveCliHost
    });

    let localRespReceiveTime = Date.now();

    await forEachSeries(
      syncRepoResp.payload.restDeletedFiles,
      async (x: DiskSyncFile) => {
        let filePath = `${repoDir}/${x.path}`;

        let isFileExist = await fse.pathExists(filePath);
        if (isFileExist === true) {
          await fse.remove(filePath);
        }
      }
    );

    await forEachSeries(
      syncRepoResp.payload.restChangedFiles,
      async (x: DiskSyncFile) => {
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

    let localChangesToCommit = await getChangesToCommit({
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
        logLevel: LogLevelEnum.Info,
        context: this.context,
        isJson: this.json
      });

      let serverError = new ServerError({
        message: ErEnum.MCLI_SYNC_FAILED
      });
      throw serverError;
    }

    await sleep(POSSIBLE_TIME_DIFF_MS);

    let syncTime = await makeSyncTime({ skipDelay: true });

    let newSyncConfig = await writeSyncConfig({
      repoPath: repoDir,
      syncTime: syncTime
    });

    let filesUrl = getFilesUrl({
      host: this.context.config.mproveCliHost,
      orgId: syncRepoResp.payload.repo.orgId,
      projectId: this.projectId,
      repoId: syncRepoResp.payload.repo.repoId,
      branch: currentBranchName,
      env: this.env
    });

    let log: any = {
      message: `Sync completed`,
      validationErrorsTotal: syncRepoResp.payload.struct.errors.length
    };

    if (this.getRepo === true) {
      let repo = syncRepoResp.payload.repo;

      if (this.getRepoNodes === false) {
        delete repo.nodes;
      }

      delete repo.changesToCommit;
      delete repo.changesToPush;

      log.repo = repo;
    }

    if (this.getErrors === true) {
      log.validationErrors = syncRepoResp.payload.struct.errors;
    }

    if (this.debug === true) {
      log.debug = {
        localChangedFiles: localChangedFiles,
        localDeletedFiles: localDeletedFiles,
        restChangedFiles: syncRepoResp.payload.restChangedFiles,
        restDeletedFiles: syncRepoResp.payload.restDeletedFiles,
        localChangesToCommit: localChangesToCommit,
        devChangesToCommit: devChangesToCommit,
        needValidate: syncRepoResp.payload.needValidate,
        structId: syncRepoResp.payload.struct.structId,
        lastSyncTime: lastSyncTime,
        syncTime: newSyncConfig.lastSyncTime,
        reqTimeDiff: syncRepoResp.payload.devReqReceiveTime - localReqSentTime,
        respTimeDiff:
          localRespReceiveTime - syncRepoResp.payload.devRespSentTime
      };
    }

    log.url = filesUrl;

    logToConsoleMcli({
      log: log,
      logLevel: LogLevelEnum.Info,
      context: this.context,
      isJson: this.json
    });
  }
}
