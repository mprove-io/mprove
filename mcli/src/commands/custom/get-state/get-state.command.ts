import { Result } from '@praha/byethrow';
import { Command, Option } from 'clipanion';
import * as t from 'typanion';
import { PROD_REPO_ID } from '#common/constants/top';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { ToBackendGetStateOutput } from '#common/types/backend/routes/state/get-state/get-state-output';
import type { ToBackendGetStateRequest } from '#common/types/backend/routes/state/get-state/get-state-request';
import type { ToBackendGetStateResponse } from '#common/types/backend/routes/state/get-state/get-state-response';
import {
  type RepoType,
  repoTypeValues
} from '#common/types/disk/parts/repo/repo-type';
import { CustomCommand } from '#mcli/classes/custom-command/custom-command';
import { getApiKeyRepoIdResult } from '#mcli/functions/get-api-key-repo-id-result/get-api-key-repo-id-result';
import { mreqResult } from '#mcli/functions/mreq-result/mreq-result';
import { logToConsoleMcli } from '#mcli/functions/top/log-to-console-mcli/log-to-console-mcli';
import type { GetApiKeyRepoIdError } from '#mcli/types/function-errors/get-api-key-repo-id-error';
import type { GetStateCommandError } from '#mcli/types/function-errors/get-state-command-error';
import type { MreqError } from '#mcli/types/function-errors/mreq-error';

export class GetStateCommand extends CustomCommand {
  static paths = [['get-state']];

  static usage = Command.Usage({
    description:
      'Get state (models, dashboards, charts, reports, metrics, errors, repo nodes)',
    examples: [
      [
        'Get Dev repo state',
        'mprove get-state --project-id DXYE72ODCP5LWPWH2EXQ --repo-type dev --branch main --env prod --get-repo --get-repo-nodes'
      ],
      [
        'Get Production repo state',
        'mprove get-state --project-id DXYE72ODCP5LWPWH2EXQ --repo-type production --branch main --env prod --get-models --get-dashboards --get-charts --get-metrics --get-reports'
      ]
    ]
  });

  projectId = Option.String('--project-id', {
    description: '(optional if set through env var) Project Id'
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

  getErrors = Option.Boolean('--get-errors', false, {
    description: '(default false), show validation errors in output'
  });

  getRepo = Option.Boolean('--get-repo', false, {
    description: '(default false), show repo in output'
  });

  getRepoNodes = Option.Boolean('--get-repo-nodes', false, {
    description: '(default false), show repo nodes in output'
  });

  getModels = Option.Boolean('--get-models', false, {
    description: '(default false), show modelIds in output'
  });

  getDashboards = Option.Boolean('--get-dashboards', false, {
    description: '(default false), show dashboardIds in output'
  });

  getCharts = Option.Boolean('--get-charts', false, {
    description: '(default false), show chartIds in output'
  });

  getMetrics = Option.Boolean('--get-metrics', false, {
    description: '(default false), show metricIds in output'
  });

  getReports = Option.Boolean('--get-reports', false, {
    description: '(default false), show reportIds in output'
  });

  json = Option.Boolean('--json', false, {
    description: '(default false)'
  });

  envFilePath = Option.String('--env-file-path', {
    description: '(optional) Path to ".env" file'
  });

  override async act(): Result.ResultAsync<void, GetStateCommandError> {
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

    let getStateReqPayload: ToBackendGetStateRequest['input'] = {
      projectId: this.projectId,
      repoId: repoId,
      branchId: this.branch,
      envId: this.env,
      isFetch: true,
      getErrors: this.getErrors,
      getRepo: this.getRepo,
      getRepoNodes: this.getRepoNodes,
      getModels: this.getModels,
      getDashboards: this.getDashboards,
      getCharts: this.getCharts,
      getMetrics: this.getMetrics,
      getReports: this.getReports
    };

    let getStateOutputResult: Result.Result<
      ToBackendGetStateOutput,
      MreqError<ToBackendGetStateResponse>
    > = await mreqResult({
      apiKey: apiKey,
      route: 'api/ToBackendGetState',
      payload: getStateReqPayload,
      host: this.context.config.mproveCliHost
    });

    if (Result.isFailure(getStateOutputResult)) {
      return getStateOutputResult;
    }

    let getStateOutput: ToBackendGetStateOutput = getStateOutputResult.value;

    logToConsoleMcli({
      log: getStateOutput,
      logLevel: 'Info',
      context: this.context,
      isJson: this.json
    });

    return Result.succeed();
  }
}
