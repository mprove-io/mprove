import { Command, Option } from 'clipanion';
import * as t from 'typanion';
import { PROD_REPO_ID } from '#common/constants/top';
import { ApiKeyTypeEnum } from '#common/enums/api-key-type.enum';
import { ErEnum } from '#common/enums/er.enum';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { QueryStatusEnum } from '#common/enums/query-status.enum';
import { RepoTypeEnum } from '#common/enums/repo-type.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { isDefined } from '#common/functions/is-defined';
import { isUndefined } from '#common/functions/is-undefined';
import type { Query } from '#common/interfaces/blockml/query';
import type { RunChart } from '#common/interfaces/to-backend/run/run-chart';
import type { RunDashboard } from '#common/interfaces/to-backend/run/run-dashboard';
import {
  ToBackendRunRequestPayload,
  ToBackendRunResponse
} from '#common/interfaces/to-backend/run/to-backend-run';
import { ServerError } from '#common/models/server-error';
import { getConfig } from '#mcli/config/get.config';
import { logToConsoleMcli } from '#mcli/functions/log-to-console-mcli';
import { mreq } from '#mcli/functions/mreq';
import { CustomCommand } from '#mcli/models/custom-command';

export class RunCommand extends CustomCommand {
  static paths = [['run']];

  static usage = Command.Usage({
    description: 'Run dashboards and charts',
    examples: [
      [
        'Run for Dev repo and wait for completion',
        'mprove run --project-id DXYE72ODCP5LWPWH2EXQ --repo dev --branch main --env prod --wait --get-dashboards --get-charts'
      ],
      [
        'Run dashboards d1 and d2 for Dev repo',
        'mprove run --project-id DXYE72ODCP5LWPWH2EXQ --repo dev --branch main --env prod --no-charts --dashboard-ids d1,d2'
      ],
      [
        'Run for Production repo',
        'mprove run --project-id DXYE72ODCP5LWPWH2EXQ --repo production --branch main --env prod'
      ]
    ]
  });

  projectId = Option.String('--project-id', {
    description: '(required) Project Id'
  });

  repo = Option.String('--repo', {
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

    if (this.noDashboards === true && this.getDashboards === true) {
      let serverError = new ServerError({
        message: ErEnum.MCLI_MUTUALLY_EXCLUSIVE_FLAGS,
        displayData: `no-dashboards and get-dashboards`,
        originalError: null
      });
      throw serverError;
    }

    if (this.noDashboards === true && isDefined(this.dashboardIds)) {
      let serverError = new ServerError({
        message: ErEnum.MCLI_MUTUALLY_EXCLUSIVE_FLAGS,
        displayData: `no-dashboards and dashboard-ids`,
        originalError: null
      });
      throw serverError;
    }

    if (this.noCharts === true && this.getCharts === true) {
      let serverError = new ServerError({
        message: ErEnum.MCLI_MUTUALLY_EXCLUSIVE_FLAGS,
        displayData: `no-charts and get-charts`,
        originalError: null
      });
      throw serverError;
    }

    if (this.noCharts === true && isDefined(this.chartIds)) {
      let serverError = new ServerError({
        message: ErEnum.MCLI_MUTUALLY_EXCLUSIVE_FLAGS,
        displayData: `no-charts and chart-ids`,
        originalError: null
      });
      throw serverError;
    }

    if (isDefined(this.sleep) && this.wait === false) {
      let serverError = new ServerError({
        message: ErEnum.MCLI_SLEEP_SECONDS_DOES_NOT_WORK_WITHOUT_WAIT,
        originalError: null
      });
      throw serverError;
    }

    let apiKey = this.context.config.mproveCliApiKey;

    let repoId =
      this.repo === RepoTypeEnum.Production
        ? PROD_REPO_ID
        : apiKey.startsWith(`${ApiKeyTypeEnum.SK}-`)
          ? apiKey.split('-')[2].toLowerCase()
          : apiKey.split('-')[2];

    let runReqPayload: ToBackendRunRequestPayload = {
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
      noCharts: this.noCharts
    };

    let runResp = await mreq<ToBackendRunResponse>({
      apiKey: apiKey,
      pathInfoName: ToBackendRequestInfoNameEnum.ToBackendRun,
      payload: runReqPayload,
      host: this.context.config.mproveCliHost
    });

    let p = runResp.payload;

    let errorCharts: RunChart[] =
      p.queriesStats.error === 0
        ? []
        : p.charts
            .filter(x => x.query.status === QueryStatusEnum.Error)
            .map(v => ({
              title: v.title,
              chartId: v.chartId,
              url: v.url,
              query: {
                lastErrorMessage: v.query.lastErrorMessage,
                status: v.query.status,
                queryId: v.query.queryId
              } as Query
            }));

    let errorDashboards: RunDashboard[] =
      p.queriesStats.error === 0
        ? []
        : p.dashboards
            .filter(
              x =>
                x.tiles.filter(y => y.query.status === QueryStatusEnum.Error)
                  .length > 0
            )
            .map(d => ({
              title: d.title,
              dashboardId: d.dashboardId,
              url: d.url,
              tiles: d.tiles
                .filter(q => q.query.status === QueryStatusEnum.Error)
                .map(r => ({
                  title: r.title,
                  query: {
                    lastErrorMessage: r.query.lastErrorMessage,
                    status: r.query.status,
                    queryId: r.query.queryId
                  } as Query
                }))
            }));

    let log: any = {};

    if (this.getDashboards === true) {
      log.dashboards = p.dashboards;
    }

    if (this.getCharts === true) {
      log.charts = p.charts;
    }

    log.errorCharts = errorCharts;
    log.errorDashboards = errorDashboards;
    log.queriesStats = p.queriesStats;

    logToConsoleMcli({
      log: log,
      logLevel: LogLevelEnum.Info,
      context: this.context,
      isJson: this.json
    });
  }
}
