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

export class DeleteBranchCommand extends CustomCommand {
  static paths = [['delete-branch']];

  static usage = Command.Usage({
    description: 'Delete branch',
    examples: [
      [
        'Delete branch for Dev repo',
        'mprove delete-branch --project-id DXYE72ODCP5LWPWH2EXQ --repo dev --branch b1'
      ],
      [
        'Delete branch for Production repo',
        'mprove delete-branch --project-id DXYE72ODCP5LWPWH2EXQ --repo production --branch b1'
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
    description: '(required) Branch name'
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

    let deleteBranchReqPayload: apiToBackend.ToBackendDeleteBranchRequestPayload =
      {
        projectId: this.projectId,
        isRepoProd: isRepoProd,
        branchId: this.branch
      };

    let deleteBranchResp =
      await mreq<apiToBackend.ToBackendDeleteBranchResponse>({
        loginToken: loginToken,
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendDeleteBranch,
        payload: deleteBranchReqPayload,
        host: this.context.config.mproveCliHost
      });

    let log: any = {
      message: `Deleted branch "${this.branch}"`
    };

    logToConsoleMcli({
      log: log,
      logLevel: common.LogLevelEnum.Info,
      context: this.context,
      isJson: this.json
    });
  }
}
