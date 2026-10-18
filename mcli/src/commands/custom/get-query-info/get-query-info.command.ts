import { Result } from '@praha/byethrow';
import { Command, Option } from 'clipanion';
import * as t from 'typanion';
import { PROD_REPO_ID } from '#common/constants/top';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { ToBackendGetQueryInfoOutput } from '#common/types/backend/routes/query-info/get-query-info/get-query-info-output';
import type { ToBackendGetQueryInfoRequest } from '#common/types/backend/routes/query-info/get-query-info/get-query-info-request';
import type { ToBackendGetQueryInfoResponse } from '#common/types/backend/routes/query-info/get-query-info/get-query-info-response';
import {
  type RepoType,
  repoTypeValues
} from '#common/types/disk/parts/repo/repo-type';
import type { TimeSpec } from '#common/types/shared/time/timespec';
import { CustomCommand } from '#mcli/classes/custom-command/custom-command';
import { getApiKeyRepoId } from '#mcli/functions/get-api-key-repo-id/get-api-key-repo-id';
import { mreq } from '#mcli/functions/mreq/mreq';
import { logToConsoleMcli } from '#mcli/functions/top/log-to-console-mcli/log-to-console-mcli';
import type { GetApiKeyRepoIdError } from '#mcli/types/function-errors/get-api-key-repo-id-error';
import type { GetQueryInfoCommandError } from '#mcli/types/function-errors/get-query-info-command-error';
import type { MreqError } from '#mcli/types/function-errors/mreq-error';

export class GetQueryInfoCommand extends CustomCommand {
  static paths = [['get-query-info']];

  static usage = Command.Usage({
    description: 'Get query info',
    examples: [
      [
        'Get Query Info for Chart',
        'mprove get-query-info --project-id DXYE72ODCP5LWPWH2EXQ --repo-type dev --branch main --env prod --chart-id v1 --get-malloy --get-sql --get-data'
      ],
      [
        'Get Query Info for Dashboard',
        'mprove get-query-info --project-id DXYE72ODCP5LWPWH2EXQ --repo-type dev --branch main --env prod --dashboard-id d1 --get-malloy --get-sql --get-data'
      ],
      [
        'Get Query Info for Report',
        'mprove get-query-info --project-id DXYE72ODCP5LWPWH2EXQ --repo-type dev --branch main --env prod --report-id r1 --get-malloy --get-sql --get-data'
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

  dashboardId = Option.String('--dashboard-id', {
    description:
      '(dashboard-id, chart-id or report-id required) Dashboard Id (name)'
  });

  tileIndex = Option.String('--tile-index', {
    validator: t.isNumber(),
    description: '(optional) Dashboard Tile Index starting with 0'
  });

  chartId = Option.String('--chart-id', {
    description:
      '(dashboard-id, chart-id or report-id required) Chart Id (name)'
  });

  reportId = Option.String('--report-id', {
    description:
      '(dashboard-id, chart-id or report-id required) Report Id (name)'
  });

  rowId = Option.String('--row-id', {
    description: '(optional) Report Row Id'
  });

  timezone = Option.String('--timezone', 'UTC', {
    description: '(default "UTC") Timezone'
  });

  timeSpec = Option.String('--detail', 'days', {
    description:
      '(default "days") for Report -  "timestamps" | "seconds" | "minutes" | "hours" | "days" | "weeks" | "months" | "quarters" | "years"'
  });

  timeRange = Option.String('--range', 'f`last 5 days`', {
    description: '(default "f`last 5 days`") for Report - Ts Filter Expression'
  });

  getMalloy = Option.Boolean('--get-malloy', false, {
    description: '(default false), show malloy query in output'
  });

  getSql = Option.Boolean('--get-sql', false, {
    description: '(default false), show query sql in output'
  });

  getData = Option.Boolean('--get-data', false, {
    description: '(default false), show query data in output'
  });

  json = Option.Boolean('--json', false, {
    description: '(default false)'
  });

  envFilePath = Option.String('--env-file-path', {
    description: '(optional) Path to ".env" file'
  });

  override async act(): Result.ResultAsync<void, GetQueryInfoCommandError> {
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

    let getQueryInfoReqPayload: ToBackendGetQueryInfoRequest['input'] = {
      projectId: this.projectId,
      repoId: repoId,
      branchId: this.branch,
      envId: this.env,
      chartId: this.chartId,
      dashboardId: this.dashboardId,
      tileIndex: this.tileIndex,
      reportId: this.reportId,
      rowId: this.rowId,
      timezone: this.timezone,
      timeSpec: this.timeSpec as TimeSpec,
      timeRangeFractionBrick: this.timeRange,
      getMalloy: this.getMalloy,
      getSql: this.getSql,
      getData: this.getData,
      isFetch: true
    };

    let getQueryInfoOutputResult: Result.Result<
      ToBackendGetQueryInfoOutput,
      MreqError<ToBackendGetQueryInfoResponse>
    > = await mreq({
      apiKey: apiKey,
      route: 'api/ToBackendGetQueryInfo',
      payload: getQueryInfoReqPayload,
      host: this.context.config.mproveCliHost
    });

    if (Result.isFailure(getQueryInfoOutputResult)) {
      return getQueryInfoOutputResult;
    }

    let getQueryInfoOutput: ToBackendGetQueryInfoOutput =
      getQueryInfoOutputResult.value;

    logToConsoleMcli({
      log: getQueryInfoOutput,
      logLevel: 'Info',
      context: this.context,
      isJson: this.json
    });

    return Result.succeed();
  }
}
