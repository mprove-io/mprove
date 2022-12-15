import { Command, Option } from 'clipanion';
import * as t from 'typanion';
import { apiToBackend } from '~mcli/barrels/api-to-backend';
import { common } from '~mcli/barrels/common';
import { enums } from '~mcli/barrels/enums';
import { getConfig } from '~mcli/config/get.config';
import { getLoginToken } from '~mcli/functions/get-login-token';
import { logToConsoleMcli } from '~mcli/functions/log-to-console-mcli';
import { mreq } from '~mcli/functions/mreq';
import { CustomCommand } from '~mcli/models/custom-command';

export class CommitCommand extends CustomCommand {
  static paths = [['commit']];

  static usage = Command.Usage({
    description: 'Commit changes for repo',
    examples: [
      [
        'Commit changes for Production repo',
        'mprove commit -p DXYE72ODCP5LWPWH2EXQ --repo production --branch main'
      ],
      [
        'Commit changes for Dev repo',
        'mprove commit -p DXYE72ODCP5LWPWH2EXQ --repo dev --branch main'
      ]
    ]
  });

  projectId = Option.String('-p', {
    required: true,
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

  // verbose = Option.Boolean('--verbose', false, {
  //   description: '(default false)'
  // });

  json = Option.Boolean('--json', false, {
    description: '(default false)'
  });

  async execute() {
    if (common.isUndefined(this.context.config)) {
      this.context.config = getConfig();
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

    let repo = commitRepoResp.payload.repo;

    repo.nodes = undefined;

    let log: any = {
      repo: repo
    };

    logToConsoleMcli({
      log: log,
      logLevel: common.LogLevelEnum.Info,
      context: this.context,
      isJson: this.json
    });
  }
}
