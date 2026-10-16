import { Result } from '@praha/byethrow';
import { Command, Option } from 'clipanion';
import * as t from 'typanion';
import { PROD_REPO_ID } from '#common/constants/top';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { ToBackendGetConnectionSchemasOutput } from '#common/types/backend/routes/connections/get-connection-schemas/get-connection-schemas-output';
import type { ToBackendGetConnectionSchemasRequest } from '#common/types/backend/routes/connections/get-connection-schemas/get-connection-schemas-request';
import type { ToBackendGetConnectionSchemasResponse } from '#common/types/backend/routes/connections/get-connection-schemas/get-connection-schemas-response';
import {
  type RepoType,
  repoTypeValues
} from '#common/types/disk/parts/repo/repo-type';
import { CustomCommand } from '#mcli/classes/custom-command/custom-command';
import { getApiKeyRepoIdResult } from '#mcli/functions/get-api-key-repo-id-result/get-api-key-repo-id-result';
import { mreqResult } from '#mcli/functions/mreq-result/mreq-result';
import { logToConsoleMcli } from '#mcli/functions/top/log-to-console-mcli/log-to-console-mcli';
import type { GetApiKeyRepoIdError } from '#mcli/types/function-errors/get-api-key-repo-id-error';
import type { GetSchemasCommandError } from '#mcli/types/function-errors/get-schemas-command-error';
import type { MreqError } from '#mcli/types/function-errors/mreq-error';
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
    validator: t.isEnum(repoTypeValues),
    description: `(required, "${'dev' satisfies RepoType}", "${'production' satisfies RepoType}" or "${'session' satisfies RepoType}")`
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

  override async act(): Result.ResultAsync<void, GetSchemasCommandError> {
    this.projectId = this.projectId || this.context.config.mproveCliProjectId;

    if (isUndefined(this.projectId)) {
      return Result.fail({ code: 'MCLI_PROJECT_ID_IS_NOT_DEFINED' });
    }

    let apiKey = this.context.config.mproveCliApiKey;

    let repoIdResult: Result.Result<string, GetApiKeyRepoIdError> =
      this.repoType === 'production'
        ? Result.succeed(PROD_REPO_ID)
        : getApiKeyRepoIdResult({ apiKey: apiKey });

    if (Result.isFailure(repoIdResult)) {
      return repoIdResult;
    }

    let repoId: string = repoIdResult.value;

    let getSchemasReqPayload: ToBackendGetConnectionSchemasRequest['input'] = {
      projectId: this.projectId,
      envId: this.env,
      repoId: repoId,
      branchId: this.branch,
      isRefreshExistingCache: this.isRefreshExistingCache
    };

    let getSchemasOutputResult: Result.Result<
      ToBackendGetConnectionSchemasOutput,
      MreqError<ToBackendGetConnectionSchemasResponse>
    > = await mreqResult({
      apiKey: apiKey,
      route: 'api/ToBackendGetConnectionSchemas',
      payload: getSchemasReqPayload,
      host: this.context.config.mproveCliHost
    });

    if (Result.isFailure(getSchemasOutputResult)) {
      return getSchemasOutputResult;
    }

    let getSchemasOutput: ToBackendGetConnectionSchemasOutput =
      getSchemasOutputResult.value;

    let log = processGetConnectionSchemasPayload({
      payload: getSchemasOutput
    });

    logToConsoleMcli({
      log: log,
      logLevel: 'Info',
      context: this.context,
      isJson: this.json
    });

    return Result.succeed();
  }
}
