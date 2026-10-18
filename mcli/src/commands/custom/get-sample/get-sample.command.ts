import { Result } from '@praha/byethrow';
import { Command, Option } from 'clipanion';
import * as t from 'typanion';

import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { ToBackendGetConnectionSampleOutput } from '#common/types/backend/routes/connections/get-connection-sample/get-connection-sample-output';
import type { ToBackendGetConnectionSampleRequest } from '#common/types/backend/routes/connections/get-connection-sample/get-connection-sample-request';
import type { ToBackendGetConnectionSampleResponse } from '#common/types/backend/routes/connections/get-connection-sample/get-connection-sample-response';
import { CustomCommand } from '#mcli/classes/custom-command/custom-command';
import { mreq } from '#mcli/functions/mreq/mreq';
import { logToConsoleMcli } from '#mcli/functions/top/log-to-console-mcli/log-to-console-mcli';
import type { GetSampleCommandError } from '#mcli/types/function-errors/get-sample-command-error';
import type { MreqError } from '#mcli/types/function-errors/mreq-error';

export class GetSampleCommand extends CustomCommand {
  static paths = [['get-sample']];

  static usage = Command.Usage({
    description:
      'Fetch sample data rows from a database table or column for a project connection',
    examples: [
      [
        'Get sample data from a table',
        'mprove get-sample --project-id DXYE72ODCP5LWPWH2EXQ --env prod --connection-id c1_postgres --schema public --table users'
      ],
      [
        'Get sample data from a specific column with offset',
        'mprove get-sample --project-id DXYE72ODCP5LWPWH2EXQ --env prod --connection-id c1_postgres --schema public --table users --column user_id --offset 10'
      ]
    ]
  });

  projectId = Option.String('--project-id', {
    description: '(required) Project Id'
  });

  env = Option.String('--env', 'prod', {
    description: '(default "prod") Environment'
  });

  connectionId = Option.String('--connection-id', {
    required: true,
    description: '(required) Connection Id'
  });

  schema = Option.String('--schema', {
    required: true,
    description: '(required) Schema Name'
  });

  table = Option.String('--table', {
    required: true,
    description: '(required) Table Name'
  });

  column = Option.String('--column', {
    description: '(optional) Column Name'
  });

  offset = Option.String('--offset', {
    validator: t.isNumber(),
    description: '(optional) Offset for pagination'
  });

  json = Option.Boolean('--json', false, {
    description: '(default false)'
  });

  envFilePath = Option.String('--env-file-path', {
    description: '(optional) Path to ".env" file'
  });

  override async act(): Result.ResultAsync<void, GetSampleCommandError> {
    this.projectId = this.projectId || this.context.config.mproveCliProjectId;

    if (isUndefined(this.projectId)) {
      return Result.fail({ code: 'MCLI_PROJECT_ID_IS_NOT_DEFINED' });
    }

    let apiKey = this.context.config.mproveCliApiKey;

    let getSampleReqPayload: ToBackendGetConnectionSampleRequest['input'] = {
      projectId: this.projectId,
      envId: this.env,
      connectionId: this.connectionId,
      schemaName: this.schema,
      tableName: this.table,
      columnName: this.column,
      offset: this.offset
    };

    let getSampleOutputResult: Result.Result<
      ToBackendGetConnectionSampleOutput,
      MreqError<ToBackendGetConnectionSampleResponse>
    > = await mreq({
      apiKey: apiKey,
      route: 'api/ToBackendGetConnectionSample',
      payload: getSampleReqPayload,
      host: this.context.config.mproveCliHost
    });

    if (Result.isFailure(getSampleOutputResult)) {
      return getSampleOutputResult;
    }

    let getSampleOutput: ToBackendGetConnectionSampleOutput =
      getSampleOutputResult.value;

    logToConsoleMcli({
      log: getSampleOutput,
      logLevel: 'Info',
      context: this.context,
      isJson: this.json
    });

    return Result.succeed();
  }
}
