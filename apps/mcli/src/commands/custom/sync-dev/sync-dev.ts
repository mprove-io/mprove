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

export class SyncDevRepoCommand extends CustomCommand {
  static paths = [['sync', 'dev']];

  static usage = Command.Usage({
    description: 'Synchronize files between Local and personal Dev repository',
    examples: [
      [
        'Synchronize files between Local and personal Dev repository',
        'sync dev --projectId DXYE72ODCP5LWPWH2EXQ --env prod'
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

    //

    let paths = await nodeCommon.gitLsFiles(repoDir);

    logToConsoleMcli({
      log: {
        paths: paths
      },
      logLevel: common.LogLevelEnum.Info,
      context: this.context,
      isJson: this.json
    });

    return;

    //

    let headOid = head.id();
    let lastCommit = headOid.tostrS();

    let statusFiles: nodegit.StatusFile[] = await gitRepo.getStatus();

    let { changedFiles, deletedFiles } = await nodeCommon.getSyncFiles({
      repoDir: repoDir,
      statusFiles: statusFiles
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

    let syncRepoReqPayload: apiToBackend.ToBackendSyncRepoRequestPayload = {
      projectId: this.projectId,
      branchId: currentBranchName,
      envId: this.envId,
      lastCommit: lastCommit,
      localChangedFiles: localChangedFiles,
      localDeletedFiles: localDeletedFiles
    };

    let syncRepoResp = await mreq<apiToBackend.ToBackendSyncRepoResponse>({
      token: loginUserResp.payload.token,
      pathInfoName: apiToBackend.ToBackendRequestInfoNameEnum.ToBackendSyncRepo,
      payload: syncRepoReqPayload,
      config: this.context.config
    });

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

    logToConsoleMcli({
      log: {
        errors: syncRepoResp.payload.struct.errors
      },
      logLevel: common.LogLevelEnum.Info,
      context: this.context,
      isJson: this.json
    });
  }
}
