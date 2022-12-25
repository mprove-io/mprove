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

export class PullCommand extends CustomCommand {
  static paths = [['pull']];

  static usage = Command.Usage({
    description:
      'Pull committed changes from Remote to repo, validate BlockML for selected env',
    examples: [
      [
        'Pull committed changes from Remote to Dev repo, validate BlockML for env prod',
        'mprove pull --project-id DXYE72ODCP5LWPWH2EXQ --repo dev --branch main --env prod'
      ],
      [
        'Pull committed changes from Remote to Production repo, validate BlockML for env prod',
        'mprove pull --project-id DXYE72ODCP5LWPWH2EXQ --repo production --branch main --env prod'
      ]
    ]
  });

  projectId = Option.String('--project-id', {
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

  envFilePath = Option.String('--env-file-path', {
    description: '(optional) Path to ".env" file'
  });

  async execute() {
    if (common.isUndefined(this.context.config)) {
      this.context.config = getConfig(this.envFilePath);
    }

    let isRepoProd = this.repo === 'production' ? true : false;

    let loginToken = await getLoginToken(this.context);

    let pullRepoReqPayload: apiToBackend.ToBackendPullRepoRequestPayload = {
      projectId: this.projectId,
      isRepoProd: isRepoProd,
      branchId: this.branch,
      envId: this.env
    };

    let pullRepoResp = await mreq<apiToBackend.ToBackendPullRepoResponse>({
      loginToken: loginToken,
      pathInfoName: apiToBackend.ToBackendRequestInfoNameEnum.ToBackendPullRepo,
      payload: pullRepoReqPayload,
      host: this.context.config.mproveCliHost
    });

    let log: any = {
      errorsTotal: pullRepoResp.payload.struct.errors.length
    };

    if (this.getErrors === true) {
      log.errors = pullRepoResp.payload.struct.errors;
    }

    logToConsoleMcli({
      log: log,
      logLevel: common.LogLevelEnum.Info,
      context: this.context,
      isJson: this.json
    });
  }
}
