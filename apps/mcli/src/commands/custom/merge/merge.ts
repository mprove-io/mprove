import { Command, Option } from 'clipanion';
import { apiToBackend } from '~mcli/barrels/api-to-backend';
import { common } from '~mcli/barrels/common';
import { getConfig } from '~mcli/config/get.config';
import { getLoginToken } from '~mcli/functions/get-login-token';
import { logToConsoleMcli } from '~mcli/functions/log-to-console-mcli';
import { mreq } from '~mcli/functions/mreq';
import { CustomCommand } from '~mcli/models/custom-command';

export class MergeCommand extends CustomCommand {
  static paths = [['merge']];

  static usage = Command.Usage({
    description:
      'Merge their-branch to branch for Dev repo, validate BlockML for selected env',
    examples: [
      [
        'Merge their-branch to branch for Dev repo, validate BlockML for env prod',
        'mprove merge -p DXYE72ODCP5LWPWH2EXQ --their-branch b1 --branch main --env prod'
      ]
    ]
  });

  projectId = Option.String('-p', {
    required: true,
    description: '(required) Project Id'
  });

  branch = Option.String('--branch', {
    required: true,
    description: '(required) Git Branch'
  });

  theirBranch = Option.String('--their-branch', {
    required: true,
    description: '(required) Their git Branch'
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

    let loginToken = await getLoginToken(this.context);

    let mergeRepoReqPayload: apiToBackend.ToBackendMergeRepoRequestPayload = {
      projectId: this.projectId,
      branchId: this.branch,
      theirBranchId: this.theirBranch,
      envId: this.env
    };

    let mergeRepoResp = await mreq<apiToBackend.ToBackendMergeRepoResponse>({
      loginToken: loginToken,
      pathInfoName:
        apiToBackend.ToBackendRequestInfoNameEnum.ToBackendMergeRepo,
      payload: mergeRepoReqPayload,
      host: this.context.config.mproveCliHost
    });

    let log: any = {
      errorsTotal: mergeRepoResp.payload.struct.errors.length
    };

    if (this.getErrors === true) {
      log.errors = mergeRepoResp.payload.struct.errors;
    }

    logToConsoleMcli({
      log: log,
      logLevel: common.LogLevelEnum.Info,
      context: this.context,
      isJson: this.json
    });
  }
}
