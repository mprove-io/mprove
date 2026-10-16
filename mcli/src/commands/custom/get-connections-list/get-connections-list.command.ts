import { Result } from '@praha/byethrow';
import { Command, Option } from 'clipanion';

import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { ToBackendGetConnectionsListOutput } from '#common/types/backend/routes/connections/get-connections-list/get-connections-list-output';
import type { ToBackendGetConnectionsListRequest } from '#common/types/backend/routes/connections/get-connections-list/get-connections-list-request';
import type { ToBackendGetConnectionsListResponse } from '#common/types/backend/routes/connections/get-connections-list/get-connections-list-response';
import { CustomCommand } from '#mcli/classes/custom-command/custom-command';
import { mreqResult } from '#mcli/functions/mreq-result/mreq-result';
import { logToConsoleMcli } from '#mcli/functions/top/log-to-console-mcli/log-to-console-mcli';
import type { GetConnectionsListCommandError } from '#mcli/types/function-errors/get-connections-list-command-error';
import type { MreqError } from '#mcli/types/function-errors/mreq-error';

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

  override async act(): Result.ResultAsync<
    void,
    GetConnectionsListCommandError
  > {
    this.projectId = this.projectId || this.context.config.mproveCliProjectId;

    if (isUndefined(this.projectId)) {
      return Result.fail({ code: 'MCLI_PROJECT_ID_IS_NOT_DEFINED' });
    }

    let apiKey = this.context.config.mproveCliApiKey;

    let getConnectionsListReqPayload: ToBackendGetConnectionsListRequest['input'] =
      {
        projectId: this.projectId,
        envId: this.env
      };

    let getConnectionsListOutputResult: Result.Result<
      ToBackendGetConnectionsListOutput,
      MreqError<ToBackendGetConnectionsListResponse>
    > = await mreqResult({
      apiKey: apiKey,
      route: 'api/ToBackendGetConnectionsList',
      payload: getConnectionsListReqPayload,
      host: this.context.config.mproveCliHost
    });

    if (Result.isFailure(getConnectionsListOutputResult)) {
      return getConnectionsListOutputResult;
    }

    let getConnectionsListOutput: ToBackendGetConnectionsListOutput =
      getConnectionsListOutputResult.value;

    logToConsoleMcli({
      log: getConnectionsListOutput,
      logLevel: 'Info',
      context: this.context,
      isJson: this.json
    });

    return Result.succeed();
  }
}
