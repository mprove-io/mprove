import { Command, Option } from 'clipanion';
import * as t from 'typanion';
import { apiToBackend } from '~mcli/barrels/api-to-backend';
import { common } from '~mcli/barrels/common';
import { enums } from '~mcli/barrels/enums';
import { getConfig } from '~mcli/config/get.config';
import { logToConsoleMcli } from '~mcli/functions/log-to-console-mcli';
import { mreq } from '~mcli/functions/mreq';
import { CustomCommand } from '~mcli/models/custom-command';

export class PullRepoCommand extends CustomCommand {
  static paths = [['pull', 'repo']];

  static usage = Command.Usage({
    description:
      'Pull committed changes from Remote to selected repo, validate BlockML for selected env',
    examples: [
      [
        'Pull committed changes from Remote to Production repo, validate BlockML for env prod',
        'mprove pull repo --project DXYE72ODCP5LWPWH2EXQ --repo production --branch main --env prod'
      ],
      [
        'Pull committed changes from Remote to Dev repo, validate BlockML for env prod',
        'mprove pull repo --project DXYE72ODCP5LWPWH2EXQ --repo dev --branch main --env prod'
      ]
    ]
  });

  project = Option.String('--project', {
    required: true,
    description: '(required) Project Id'
  });

  repo = Option.String('--repo', {
    required: true,
    validator: t.isEnum(enums.RepoEnum),
    description:
      '(required, "dev" or "production") Dev or Production repository'
  });

  branchId = Option.String('--branch', {
    required: true,
    description: '(required) Git Branch'
  });

  env = Option.String('--env', {
    required: true,
    description: '(required) Environment'
  });

  verbose = Option.Boolean('--verbose', false, {
    description: '(default false)'
  });

  json = Option.Boolean('--json', false, {
    description: '(default false)'
  });

  async execute() {
    if (common.isUndefined(this.context.config)) {
      this.context.config = getConfig();
    }

    let isRepoProd = this.repo === 'production' ? true : false;

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

    let pullRepoReqPayload: apiToBackend.ToBackendPullRepoRequestPayload = {
      projectId: this.project,
      isRepoProd: isRepoProd,
      branchId: this.branchId,
      envId: this.env
    };

    let pullRepoResp = await mreq<apiToBackend.ToBackendPullRepoResponse>({
      token: loginUserResp.payload.token,
      pathInfoName: apiToBackend.ToBackendRequestInfoNameEnum.ToBackendPullRepo,
      payload: pullRepoReqPayload,
      config: this.context.config
    });

    let log: any = {
      struct: {
        errorsTotal: pullRepoResp.payload.struct.errors.length
      }
    };

    if (this.verbose === true) {
      log.struct.errors = pullRepoResp.payload.struct.errors;
    }

    logToConsoleMcli({
      log: log,
      logLevel: common.LogLevelEnum.Info,
      context: this.context,
      isJson: this.json
    });
  }
}
