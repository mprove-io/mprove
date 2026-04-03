import { Command, Option } from 'clipanion';
import { ErEnum } from '#common/enums/er.enum';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { isUndefined } from '#common/functions/is-undefined';
import {
  ToBackendGetConnectionsListRequestPayload,
  ToBackendGetConnectionsListResponse
} from '#common/interfaces/to-backend/connections/to-backend-get-connections-list';
import { ServerError } from '#common/models/server-error';
import { getConfig } from '#mcli/config/get.config';
import { logToConsoleMcli } from '#mcli/functions/log-to-console-mcli';
import { mreq } from '#mcli/functions/mreq';
import { CustomCommand } from '#mcli/models/custom-command';

export class GetConnectionsListCommand extends CustomCommand {
  static paths = [['get-connections-list']];

  static usage = Command.Usage({
    description: 'Get project connections',
    examples: [
      [
        'Get connections for prod environment',
        'mprove get-connections-list --project-id DXYE72ODCP5LWPWH2EXQ --env prod'
      ],
      [
        'Get connections as JSON',
        'mprove get-connections-list --project-id DXYE72ODCP5LWPWH2EXQ --env prod --json'
      ]
    ]
  });

  projectId = Option.String('--project-id', {
    description: '(required) Project Id'
  });

  env = Option.String('--env', {
    required: true,
    description: '(required) Environment'
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

    let apiKey = this.context.config.mproveCliApiKey;

    let getConnectionsListReqPayload: ToBackendGetConnectionsListRequestPayload =
      {
        projectId: this.projectId,
        envId: this.env
      };

    let getConnectionsListResp =
      await mreq<ToBackendGetConnectionsListResponse>({
        apiKey: apiKey,
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendGetConnectionsList,
        payload: getConnectionsListReqPayload,
        host: this.context.config.mproveCliHost
      });

    logToConsoleMcli({
      log: getConnectionsListResp.payload,
      logLevel: LogLevelEnum.Info,
      context: this.context,
      isJson: this.json
    });
  }
}
