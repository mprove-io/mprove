import { Command, Option } from 'clipanion';
import * as t from 'typanion';
import { ErEnum } from '#common/enums/er.enum';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { RepoEnum } from '#common/enums/repo.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { isUndefined } from '#common/functions/is-undefined';
import {
  ToBackendGetBranchesListRequestPayload,
  ToBackendGetBranchesListResponse
} from '#common/interfaces/to-backend/branches/to-backend-get-branches-list';
import { ServerError } from '#common/models/server-error';
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
    description: '(required) Project Id'
  });

  repo = Option.String('--repo', {
    required: true,
    validator: t.isEnum(RepoEnum),
    description: `(required, "${RepoEnum.Dev}" or "${RepoEnum.Production}")`
  });

  json = Option.Boolean('--json', false, {
    description: '(default false)'
  });

  envFilePath = Option.String('--env-file-path', {
    description: '(optional) Path to ".env" file'
  });

  async execute() {
    if (isUndefined(this.context.config)) {
      this.context.config = getConfig(this.envFilePath);
    }

    this.projectId = this.projectId || this.context.config.mproveCliProjectId;

    if (isUndefined(this.projectId)) {
      let serverError = new ServerError({
        message: ErEnum.MCLI_PROJECT_ID_IS_NOT_DEFINED,
        originalError: null
      });
      throw serverError;
    }

    let isRepoProd = this.repo === 'production' ? true : false;

    let loginToken = await getLoginToken(this.context);

    let getBranchesListReqPayload: ToBackendGetBranchesListRequestPayload = {
      projectId: this.projectId
    };

    let getBranchesListResp = await mreq<ToBackendGetBranchesListResponse>({
      loginToken: loginToken,
      pathInfoName: ToBackendRequestInfoNameEnum.ToBackendGetBranchesList,
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
      logLevel: LogLevelEnum.Info,
      context: this.context,
      isJson: this.json
    });
  }
}
