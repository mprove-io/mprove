import { Command, Option } from 'clipanion';
import * as t from 'typanion';
import { ErEnum } from '#common/enums/er.enum';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { RepoEnum } from '#common/enums/repo.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { isUndefined } from '#common/functions/is-undefined';
import {
  ToBackendCreateBranchRequestPayload,
  ToBackendCreateBranchResponse
} from '#common/interfaces/to-backend/branches/to-backend-create-branch';
import { ServerError } from '#common/models/server-error';
import { getConfig } from '#mcli/config/get.config';
import { getLoginToken } from '#mcli/functions/get-login-token';
import { logToConsoleMcli } from '#mcli/functions/log-to-console-mcli';
import { mreq } from '#mcli/functions/mreq';
import { CustomCommand } from '#mcli/models/custom-command';

export class CreateBranchCommand extends CustomCommand {
  static paths = [['create-branch']];

  static usage = Command.Usage({
    description: 'Create branch',
    examples: [
      [
        'Create branch for Dev repo',
        'mprove create-branch --project-id DXYE72ODCP5LWPWH2EXQ --repo dev --new-branch b1 --from-branch main'
      ],
      [
        'Create branch for Production repo',
        'mprove create-branch --project-id DXYE72ODCP5LWPWH2EXQ --repo production --new-branch b1 --from-branch main'
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

  newBranch = Option.String('--new-branch', {
    required: true,
    description: '(required) New Branch name'
  });

  fromBranch = Option.String('--from-branch', {
    required: true,
    description: '(required) From Branch name'
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

    let createBranchReqPayload: ToBackendCreateBranchRequestPayload = {
      projectId: this.projectId,
      isRepoProd: isRepoProd,
      newBranchId: this.newBranch,
      fromBranchId: this.fromBranch
    };

    let createBranchResp = await mreq<ToBackendCreateBranchResponse>({
      loginToken: loginToken,
      pathInfoName: ToBackendRequestInfoNameEnum.ToBackendCreateBranch,
      payload: createBranchReqPayload,
      host: this.context.config.mproveCliHost
    });

    let log: any = {
      message: `Created branch "${this.newBranch}"`
    };

    logToConsoleMcli({
      log: log,
      logLevel: LogLevelEnum.Info,
      context: this.context,
      isJson: this.json
    });
  }
}
