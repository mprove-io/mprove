import { Command, Option } from 'clipanion';
import * as t from 'typanion';
import { PROD_REPO_ID } from '#common/constants/top';
import { ApiKeyTypeEnum } from '#common/enums/api-key-type.enum';
import { ErEnum } from '#common/enums/er.enum';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { RepoTypeEnum } from '#common/enums/repo-type.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { isUndefined } from '#common/functions/is-undefined';
import { ServerError } from '#common/models/server-error';
import type {
  ToBackendGetConnectionSchemasRequestPayload,
  ToBackendGetConnectionSchemasResponse
} from '#common/zod/to-backend/connections/to-backend-get-connection-schemas';
import { getConfig } from '#mcli/config/get.config';
import { logToConsoleMcli } from '#mcli/functions/log-to-console-mcli';
import { mreq } from '#mcli/functions/mreq';
import { CustomCommand } from '#mcli/models/custom-command';
import { processGetConnectionSchemasPayload } from '#node-common/functions/process-get-connection-schemas-payload';

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
    validator: t.isEnum(RepoTypeEnum),
    description: `(required, "${RepoTypeEnum.Dev}", "${RepoTypeEnum.Production}" or "${RepoTypeEnum.Session}")`
  });

  branch = Option.String('--branch', {
    required: true,
    description: '(required) Git Branch'
  });

  env = Option.String('--env', {
    required: true,
    description: '(required) Environment'
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
        message: ErEnum.MCLI_PROJECT_ID_IS_NOT_DEFINED,
        originalError: null
      });
      throw serverError;
    }

    let apiKey = this.context.config.mproveCliApiKey;

    let repoId =
      this.repoType === RepoTypeEnum.Production
        ? PROD_REPO_ID
        : apiKey.startsWith(`${ApiKeyTypeEnum.SK}-`)
          ? apiKey.split('-')[2].toLowerCase()
          : apiKey.split('-')[2];

    let getSchemasReqPayload: ToBackendGetConnectionSchemasRequestPayload = {
      projectId: this.projectId,
      envId: this.env,
      repoId: repoId,
      branchId: this.branch,
      isRefreshExistingCache: this.isRefreshExistingCache
    };

    let getSchemasResp = await mreq<ToBackendGetConnectionSchemasResponse>({
      apiKey: apiKey,
      pathInfoName: ToBackendRequestInfoNameEnum.ToBackendGetConnectionSchemas,
      payload: getSchemasReqPayload,
      host: this.context.config.mproveCliHost
    });

    let log = processGetConnectionSchemasPayload({
      payload: getSchemasResp.payload
    });

    logToConsoleMcli({
      log: log,
      logLevel: LogLevelEnum.Info,
      context: this.context,
      isJson: this.json
    });
  }
}
