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

export class PushCommand extends CustomCommand {
  static paths = [['push']];

  static usage = Command.Usage({
    description:
      'Push committed changes from repo to Remote, validate BlockML for selected env',
    examples: [
      [
        'Push committed changes from Dev to Remote, validate BlockML for env prod',
        'mprove push -p DXYE72ODCP5LWPWH2EXQ --repo dev --branch main --env prod'
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

  env = Option.String('--env', {
    required: true,
    description: '(required) Environment'
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

    let isRepoProd = this.repo === 'production' ? true : false;

    let loginToken = await getLoginToken(this.context);

    let pushRepoReqPayload: apiToBackend.ToBackendPushRepoRequestPayload = {
      projectId: this.projectId,
      isRepoProd: isRepoProd,
      branchId: this.branch,
      envId: this.env
    };

    let pushRepoResp = await mreq<apiToBackend.ToBackendPushRepoResponse>({
      loginToken: loginToken,
      pathInfoName: apiToBackend.ToBackendRequestInfoNameEnum.ToBackendPushRepo,
      payload: pushRepoReqPayload,
      host: this.context.config.mproveCliHost
    });

    let log: any = {
      struct: {
        errorsTotal: pushRepoResp.payload.struct.errors.length
      }
    };

    if (this.getErrors === true) {
      log.struct.errors = pushRepoResp.payload.struct.errors;
    }

    logToConsoleMcli({
      log: log,
      logLevel: common.LogLevelEnum.Info,
      context: this.context,
      isJson: this.json
    });
  }
}
