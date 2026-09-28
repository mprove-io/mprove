import { Command, Option } from 'clipanion';
import { ServerError } from '#common/classes/server-error/server-error';
import { ErEnum } from '#common/enums/er.enum';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { ToBackendGetConnectionsListOutput } from '#common/zod/backend/routes/connections/get-connections-list/get-connections-list-output';
import type { ToBackendGetConnectionsListRequest } from '#common/zod/backend/routes/connections/get-connections-list/get-connections-list-request';
import { CustomCommand } from '#mcli/classes/custom-command/custom-command';
import { getConfig } from '#mcli/config/get.config';
import { mreq } from '#mcli/functions/mreq/mreq';
import { logToConsoleMcli } from '#mcli/functions/top/log-to-console-mcli/log-to-console-mcli';

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

  env = Option.String('--env', 'prod', {
    description: '(default "prod") Environment'
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

    let getConnectionsListReqPayload: ToBackendGetConnectionsListRequest['input'] =
      {
        projectId: this.projectId,
        envId: this.env
      };

    let getConnectionsListOutput: ToBackendGetConnectionsListOutput =
      await mreq({
        apiKey: apiKey,
        route: 'api/ToBackendGetConnectionsList',
        payload: getConnectionsListReqPayload,
        host: this.context.config.mproveCliHost
      });

    logToConsoleMcli({
      log: getConnectionsListOutput,
      logLevel: LogLevelEnum.Info,
      context: this.context,
      isJson: this.json
    });
  }
}
