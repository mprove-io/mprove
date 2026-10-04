import { Command, Option } from 'clipanion';
import * as t from 'typanion';
import { ServerError } from '#common/classes/server-error/server-error';
import { PROD_REPO_ID } from '#common/constants/top';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { ToBackendGetConnectionSchemasOutput } from '#common/types/backend/routes/connections/get-connection-schemas/get-connection-schemas-output';
import type { ToBackendGetConnectionSchemasRequest } from '#common/types/backend/routes/connections/get-connection-schemas/get-connection-schemas-request';
import { zRepoType } from '#common/types/disk/parts/repo/repo-type';
import { CustomCommand } from '#mcli/classes/custom-command/custom-command';
import { getConfig } from '#mcli/config/get.config';
import { mreq } from '#mcli/functions/mreq/mreq';
import { logToConsoleMcli } from '#mcli/functions/top/log-to-console-mcli/log-to-console-mcli';
import { processGetConnectionSchemasPayload } from '#node-common/functions/process-get-connection-schemas-payload/process-get-connection-schemas-payload';

export class GetSchemasCommand extends CustomCommand {
  static paths = [['get-schemas']];

  static usage = Command.Usage({
    description:
      'Fetch database schemas (tables, columns, relationships, indexes) for project connections',
    examples: [
      [
        'Get schemas for Dev repo with refresh',
        'mprove get-schemas --project-id DXYE72ODCP5LWPWH2EXQ --repo-type dev --branch main --env prod --refresh'
      ],
      [
        'Get schemas for Production repo',
        'mprove get-schemas --project-id DXYE72ODCP5LWPWH2EXQ --repo-type production --branch main --env prod'
      ]
    ]
  });

  projectId = Option.String('--project-id', {
    description: '(required) Project Id'
  });

  repoType = Option.String('--repo-type', {
    required: true,
    validator: t.isEnum(zRepoType.options),
    description: `(required, "dev", "production" or "session")`
  });

  branch = Option.String('--branch', {
    required: true,
    description: '(required) Git Branch'
  });

  env = Option.String('--env', 'prod', {
    description: '(default "prod") Environment'
  });

  isRefreshExistingCache = Option.Boolean('--refresh', false, {
    description: '(default false) Refresh schemas from database'
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
        message: 'MCLI_PROJECT_ID_IS_NOT_DEFINED',
        originalError: null
      });
      throw serverError;
    }

    let apiKey = this.context.config.mproveCliApiKey;

    let repoId =
      this.repoType === 'production'
        ? PROD_REPO_ID
        : apiKey.startsWith(`SK-`)
          ? apiKey.split('-')[2].toLowerCase()
          : apiKey.split('-')[2];

    let getSchemasReqPayload: ToBackendGetConnectionSchemasRequest['input'] = {
      projectId: this.projectId,
      envId: this.env,
      repoId: repoId,
      branchId: this.branch,
      isRefreshExistingCache: this.isRefreshExistingCache
    };

    let getSchemasOutput: ToBackendGetConnectionSchemasOutput = await mreq({
      apiKey: apiKey,
      route: 'api/ToBackendGetConnectionSchemas',
      payload: getSchemasReqPayload,
      host: this.context.config.mproveCliHost
    });

    let log = processGetConnectionSchemasPayload({
      payload: getSchemasOutput
    });

    logToConsoleMcli({
      log: log,
      logLevel: 'Info',
      context: this.context,
      isJson: this.json
    });
  }
}
