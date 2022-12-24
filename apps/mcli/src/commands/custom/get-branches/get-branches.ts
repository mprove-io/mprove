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

export class GetBranchesCommand extends CustomCommand {
  static paths = [['get-branches']];

  static usage = Command.Usage({
    description: 'Get branches',
    examples: [
      [
        'Get Dev repo branches',
        'mprove get-branches --project-id DXYE72ODCP5LWPWH2EXQ --repo dev'
      ],
      [
        'Get Production repo branches',
        'mprove get-branches --project-id DXYE72ODCP5LWPWH2EXQ --repo production'
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

  json = Option.Boolean('--json', false, {
    description: '(default false)'
  });

  async execute() {
    if (common.isUndefined(this.context.config)) {
      this.context.config = getConfig();
    }

    let isRepoProd = this.repo === 'production' ? true : false;

    let loginToken = await getLoginToken(this.context);

    let getBranchesListReqPayload: apiToBackend.ToBackendGetBranchesListRequestPayload =
      {
        projectId: this.projectId
      };

    let getBranchesListResp =
      await mreq<apiToBackend.ToBackendGetBranchesListResponse>({
        loginToken: loginToken,
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetBranchesList,
        payload: getBranchesListReqPayload,
        host: this.context.config.mproveCliHost
      });

    let log: any = {
      branches: getBranchesListResp.payload.branchesList
        .filter(x => x.isRepoProd === isRepoProd)
        .map(b => b.branchId)
    };

    logToConsoleMcli({
      log: log,
      logLevel: common.LogLevelEnum.Info,
      context: this.context,
      isJson: this.json
    });
  }
}
