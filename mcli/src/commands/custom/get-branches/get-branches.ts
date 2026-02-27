import { Command, Option } from 'clipanion';
import * as t from 'typanion';
import { PROD_REPO_ID } from '#common/constants/top';
import { ErEnum } from '#common/enums/er.enum';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { RepoParameterEnum } from '#common/enums/repo-parameter.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { isUndefined } from '#common/functions/is-undefined';
import {
  ToBackendGetBranchesListRequestPayload,
  ToBackendGetBranchesListResponse
} from '#common/interfaces/to-backend/branches/to-backend-get-branches-list';
import { ServerError } from '#common/models/server-error';
import { getConfig } from '#mcli/config/get.config';
import { getLoginToken } from '#mcli/functions/get-login-token';
import { logToConsoleMcli } from '#mcli/functions/log-to-console-mcli';
import { mreq } from '#mcli/functions/mreq';
import { CustomCommand } from '#mcli/models/custom-command';

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
    validator: t.isEnum(RepoParameterEnum),
    description: `(required, "${RepoParameterEnum.Dev}" or "${RepoParameterEnum.Production}")`
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

    let loginToken = await getLoginToken(this.context);

    let repoId =
      this.repo === 'production' ? PROD_REPO_ID : this.context.userId;

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
        .filter(x => x.repoId === repoId)
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
