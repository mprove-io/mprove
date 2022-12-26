import { Command, Option } from 'clipanion';
import * as t from 'typanion';
import { apiToBackend } from '~mcli/barrels/api-to-backend';
import { common } from '~mcli/barrels/common';
import { enums } from '~mcli/barrels/enums';
import { getConfig } from '~mcli/config/get.config';
import { getFilesUrl } from '~mcli/functions/get-files-url';
import { getLoginToken } from '~mcli/functions/get-login-token';
import { logToConsoleMcli } from '~mcli/functions/log-to-console-mcli';
import { mreq } from '~mcli/functions/mreq';
import { CustomCommand } from '~mcli/models/custom-command';

export class CommitCommand extends CustomCommand {
  static paths = [['commit']];

  static usage = Command.Usage({
    description: 'Commit changes',
    examples: [
      [
        'Commit changes for Dev repo',
        'mprove commit --project-id DXYE72ODCP5LWPWH2EXQ --repo dev --branch main'
      ]
    ]
  });

  projectId = Option.String('--project-id', {
    description: '(required) Project Id'
  });

  repo = Option.String('--repo', {
    required: true,
    validator: t.isEnum(enums.RepoEnum),
    description: `(required, "${enums.RepoEnum.Dev}" or "${enums.RepoEnum.Production}")`
  });

  branch = Option.String('--branch', {
    required: true,
    description: '(required) Git Branch'
  });

  commitMessage = Option.String('--commit-message', {
    required: true,
    description: '(required) Commit message'
  });

  getRepo = Option.Boolean('--get-repo', false, {
    description: '(default false), show repo in output'
  });

  json = Option.Boolean('--json', false, {
    description: '(default false)'
  });

  envFilePath = Option.String('--env-file-path', {
    description: '(optional) Path to ".env" file'
  });

  async execute() {
    if (common.isUndefined(this.context.config)) {
      this.context.config = getConfig(this.envFilePath);
    }

    this.projectId = this.projectId || this.context.config.mproveCliProjectId;

    if (common.isUndefined(this.projectId)) {
      let serverError = new common.ServerError({
        message: common.ErEnum.MCLI_PROJECT_ID_IS_NOT_DEFINED,
        originalError: null
      });
      throw serverError;
    }

    let isRepoProd = this.repo === 'production' ? true : false;

    let loginToken = await getLoginToken(this.context);

    let commitRepoReqPayload: apiToBackend.ToBackendCommitRepoRequestPayload = {
      projectId: this.projectId,
      isRepoProd: isRepoProd,
      branchId: this.branch,
      commitMessage: this.commitMessage
    };

    let commitRepoResp = await mreq<apiToBackend.ToBackendCommitRepoResponse>({
      loginToken: loginToken,
      pathInfoName:
        apiToBackend.ToBackendRequestInfoNameEnum.ToBackendCommitRepo,
      payload: commitRepoReqPayload,
      host: this.context.config.mproveCliHost
    });

    let filesUrl = getFilesUrl({
      host: this.context.config.mproveCliHost,
      orgId: commitRepoResp.payload.repo.orgId,
      projectId: this.projectId,
      repoId: commitRepoResp.payload.repo.repoId,
      branch: this.branch,
      env: common.PROJECT_ENV_PROD
    });

    let log: any = {
      message: `Created commit "${this.commitMessage}"`
    };

    if (this.getRepo === true) {
      let repo = commitRepoResp.payload.repo;

      delete repo.nodes;
      delete repo.changesToCommit;
      delete repo.changesToPush;

      log.repo = repo;
    }

    log.url = filesUrl;

    logToConsoleMcli({
      log: log,
      logLevel: common.LogLevelEnum.Info,
      context: this.context,
      isJson: this.json
    });
  }
}
