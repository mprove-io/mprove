import { Command, Option } from 'clipanion';
import * as t from 'typanion';
import { ErEnum } from '#common/enums/er.enum';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { isUndefined } from '#common/functions/is-undefined';
import {
  ToBackendGetConnectionSampleRequestPayload,
  ToBackendGetConnectionSampleResponse
} from '#common/interfaces/to-backend/connections/to-backend-get-connection-sample';
import { ServerError } from '#common/models/server-error';
import { getConfig } from '#mcli/config/get.config';
import { logToConsoleMcli } from '#mcli/functions/log-to-console-mcli';
import { mreq } from '#mcli/functions/mreq';
import { CustomCommand } from '#mcli/models/custom-command';

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

  env = Option.String('--env', {
    required: true,
    description: '(required) Environment'
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

    let getSampleReqPayload: ToBackendGetConnectionSampleRequestPayload = {
      projectId: this.projectId,
      envId: this.env,
      connectionId: this.connectionId,
      schemaName: this.schema,
      tableName: this.table,
      columnName: this.column,
      offset: this.offset
    };

    let getSampleResp = await mreq<ToBackendGetConnectionSampleResponse>({
      apiKey: apiKey,
      pathInfoName: ToBackendRequestInfoNameEnum.ToBackendGetConnectionSample,
      payload: getSampleReqPayload,
      host: this.context.config.mproveCliHost
    });

    logToConsoleMcli({
      log: getSampleResp.payload,
      logLevel: LogLevelEnum.Info,
      context: this.context,
      isJson: this.json
    });
  }
}
