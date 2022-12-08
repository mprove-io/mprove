import { Command, Option } from 'clipanion';
import * as fse from 'fs-extra';
import * as nodegit from 'nodegit';
import { forEachSeries } from 'p-iteration';
import { apiToBackend } from '~mcli/barrels/api-to-backend';
import { common } from '~mcli/barrels/common';
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
        'sync dev --projectId DXYE72ODCP5LWPWH2EXQ'
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

    // check is git repo
    let repoDir = common.isDefined(this.dir) ? this.dir : process.cwd();

    let gitRepo = <nodegit.Repository>await nodegit.Repository.open(repoDir);

    // get current branch
    let currentBranchRef = await gitRepo.getCurrentBranch();
    let currentBranchName = await nodegit.Branch.name(currentBranchRef);

    // get last commit
    let head: nodegit.Commit = await gitRepo.getHeadCommit();
    let headOid = head.id();
    let lastCommit = headOid.tostrS();

    // find git changed files
    let statusFiles: nodegit.StatusFile[] = await gitRepo.getStatus();

    let changedFiles: any[] = [];
    let deletedFiles: any[] = [];

    await forEachSeries(statusFiles, async (x: nodegit.StatusFile) => {
      let path = x.path();

      let status =
        // doesn't return booleans
        x.isNew()
          ? common.FileStatusEnum.New
          : x.isDeleted()
          ? common.FileStatusEnum.Deleted
          : x.isModified()
          ? common.FileStatusEnum.Modified
          : x.isConflicted()
          ? common.FileStatusEnum.Conflicted
          : x.isTypechange()
          ? common.FileStatusEnum.TypeChange
          : x.isRenamed()
          ? common.FileStatusEnum.Renamed
          : x.isIgnored()
          ? common.FileStatusEnum.Ignored
          : undefined;

      // read git changed files
      let content: string;
      if (status !== common.FileStatusEnum.Deleted) {
        let fullPath = `${repoDir}/${path}`;

        content = <string>await fse.readFile(fullPath, 'utf8');
      }

      let file: common.DiskFileSync = {
        path: path,
        status: status,
        content: content
      };

      if (file.status === common.FileStatusEnum.Deleted) {
        deletedFiles.push(file);
      } else {
        changedFiles.push(file);
      }
    });

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

    // send git changed files
    let syncRepoReqPayload: apiToBackend.ToBackendSyncRepoRequestPayload = {
      projectId: this.projectId,
      branchId: currentBranchName,
      envId: this.envId,
      lastCommit: lastCommit,
      changedFiles: changedFiles,
      deletedFiles: deletedFiles
    };

    let syncRepoResp = await mreq<apiToBackend.ToBackendSyncRepoResponse>({
      token: loginUserResp.payload.token,
      pathInfoName: apiToBackend.ToBackendRequestInfoNameEnum.ToBackendSyncRepo,
      payload: syncRepoReqPayload,
      config: this.context.config
    });

    // receive rest changed files
    // write rest changed files
    // log result

    logToConsoleMcli({
      log: {
        repoDir: repoDir
        // changedFiles: changedFiles,
        // deletedFiles: deletedFiles
      },
      // log: statusFiles.map(x => x.path()),
      // log: statusFiles.map(x => x.status()),
      // log: statusFiles,
      // log: headOidStr,
      // log: currentBranchName,
      // log: repoDir,
      logLevel: common.LogLevelEnum.Info,
      context: this.context,
      isJson: false
    });
  }
}
