import { Result } from '@praha/byethrow';
import { Command, Option } from 'clipanion';
import * as t from 'typanion';
import { PROD_REPO_ID } from '#common/constants/top';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { ToBackendRunOutput } from '#common/types/backend/routes/run/run/run-output';
import type { ToBackendRunRequest } from '#common/types/backend/routes/run/run/run-request';
import type { ToBackendRunResponse } from '#common/types/backend/routes/run/run/run-response';
import {
  type RepoType,
  repoTypeValues
} from '#common/types/disk/parts/repo/repo-type';
import { CustomCommand } from '#mcli/classes/custom-command/custom-command';
import { getApiKeyRepoId } from '#mcli/functions/get-api-key-repo-id/get-api-key-repo-id';
import { mreq } from '#mcli/functions/mreq/mreq';
import { logToConsoleMcli } from '#mcli/functions/top/log-to-console-mcli/log-to-console-mcli';
import type { GetApiKeyRepoIdError } from '#mcli/types/function-errors/get-api-key-repo-id-error';
import type { MreqError } from '#mcli/types/function-errors/mreq-error';
import type { RunCommandError } from '#mcli/types/function-errors/run-command-error';

export class RunCommand extends CustomCommand {
  static paths = [['run']];

  static usage = Command.Usage({
    description: 'Run dashboards, charts, and reports',
    examples: [
      [
        'Run for Dev repo and wait for completion',
        'mprove run --project-id DXYE72ODCP5LWPWH2EXQ --repo-type dev --branch main --env prod --wait --get-dashboards --get-charts'
      ],
      [
        'Run dashboards d1 and d2 for Dev repo',
        'mprove run --project-id DXYE72ODCP5LWPWH2EXQ --repo-type dev --branch main --env prod --no-charts --dashboard-ids d1,d2'
      ],
      [
        'Run for Production repo',
        'mprove run --project-id DXYE72ODCP5LWPWH2EXQ --repo-type production --branch main --env prod'
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

  concurrency = Option.String('--concurrency', {
    validator: t.isNumber(),
    description: '(optional) Max number of concurrent queries'
  });

  wait = Option.Boolean('--wait', false, {
    description: '(default false) Wait for queries completion'
  });

  sleep = Option.String('--sleep', {
    validator: t.isNumber(),
    description: '(default 3) Sleep time between queries status check, seconds'
  });

  dashboardIds = Option.String('--dashboard-ids', {
    description:
      '(optional) Filter dashboards to run by dashboard names, separated by comma'
  });

  chartIds = Option.String('--chart-ids', {
    description:
      '(optional) Filter charts to run by chart names, separated by comma'
  });

  noDashboards = Option.Boolean('--no-dashboards', false, {
    description: '(default false) Do not run dashboards'
  });

  noCharts = Option.Boolean('--no-charts', false, {
    description: '(default false) Do not run charts'
  });

  getDashboards = Option.Boolean('--get-dashboards', false, {
    description: '(default false), show dashboards in output'
  });

  getCharts = Option.Boolean('--get-charts', false, {
    description: '(default false), show charts in output'
  });

  reportIds = Option.String('--report-ids', {
    description:
      '(optional) Filter reports to run by report names, separated by comma'
  });

  noReports = Option.Boolean('--no-reports', false, {
    description: '(default false) Do not run reports'
  });

  getReports = Option.Boolean('--get-reports', false, {
    description: '(default false), show reports in output'
  });

  json = Option.Boolean('--json', false, {
    description: '(default false)'
  });

  envFilePath = Option.String('--env-file-path', {
    description: '(optional) Path to ".env" file'
  });

  override async act(): Result.ResultAsync<void, RunCommandError> {
    this.projectId = this.projectId || this.context.config.mproveCliProjectId;

    if (isUndefined(this.projectId)) {
      return Result.fail({ code: 'MCLI_PROJECT_ID_IS_NOT_DEFINED' });
    }

    let apiKey = this.context.config.mproveCliApiKey;

    let repoIdResult: Result.Result<string, GetApiKeyRepoIdError> =
      this.repoType === 'production'
        ? Result.succeed(PROD_REPO_ID)
        : getApiKeyRepoId({ apiKey: apiKey });

    if (Result.isFailure(repoIdResult)) {
      return repoIdResult;
    }

    let repoId: string = repoIdResult.value;

    let runReqPayload: ToBackendRunRequest['input'] = {
      projectId: this.projectId,
      repoId: repoId,
      branchId: this.branch,
      envId: this.env,
      concurrency: this.concurrency,
      wait: this.wait,
      sleep: this.sleep,
      dashboardIds: this.dashboardIds,
      chartIds: this.chartIds,
      noDashboards: this.noDashboards,
      noCharts: this.noCharts,
      getDashboards: this.getDashboards,
      getCharts: this.getCharts,
      reportIds: this.reportIds,
      noReports: this.noReports,
      getReports: this.getReports
    };

    let runOutputResult: Result.Result<
      ToBackendRunOutput,
      MreqError<ToBackendRunResponse>
    > = await mreq({
      apiKey: apiKey,
      route: 'api/ToBackendRun',
      payload: runReqPayload,
      host: this.context.config.mproveCliHost
    });

    if (Result.isFailure(runOutputResult)) {
      return runOutputResult;
    }

    let runOutput: ToBackendRunOutput = runOutputResult.value;

    logToConsoleMcli({
      log: runOutput,
      logLevel: 'Info',
      context: this.context,
      isJson: this.json
    });

    return Result.succeed();
  }
}
