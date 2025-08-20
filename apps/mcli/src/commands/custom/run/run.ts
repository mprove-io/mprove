import { Command, Option } from 'clipanion';
import * as t from 'typanion';
import { getConfig } from '~mcli/config/get.config';
import { getChartUrl } from '~mcli/functions/get-chart-url';
import { getDashboardUrl } from '~mcli/functions/get-dashboard-url';
import { getLoginToken } from '~mcli/functions/get-login-token';
import { queriesToStats } from '~mcli/functions/get-query-stats';
import { logToConsoleMcli } from '~mcli/functions/log-to-console-mcli';
import { mreq } from '~mcli/functions/mreq';
import { CustomCommand } from '~mcli/models/custom-command';

interface ChartPart {
  title: string;
  chartId: string;
  url: string;
  query: Query;
}

interface TilePart {
  title: string;
  query: Query;
}

interface DashboardPart {
  title: string;
  dashboardId: string;
  url: string;
  tiles: TilePart[];
}

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
    validator: t.isEnum(RepoEnum),
    description: `(required, "${RepoEnum.Dev}" or "${RepoEnum.Production}")`
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
        data: `no-dashboards and get-dashboards`,
        originalError: null
      });
      throw serverError;
    }

    if (this.noDashboards === true && isDefined(this.dashboardIds)) {
      let serverError = new ServerError({
        message: ErEnum.MCLI_MUTUALLY_EXCLUSIVE_FLAGS,
        data: `no-dashboards and dashboard-ids`,
        originalError: null
      });
      throw serverError;
    }

    if (this.noCharts === true && this.getCharts === true) {
      let serverError = new ServerError({
        message: ErEnum.MCLI_MUTUALLY_EXCLUSIVE_FLAGS,
        data: `no-charts and get-charts`,
        originalError: null
      });
      throw serverError;
    }

    if (this.noCharts === true && isDefined(this.chartIds)) {
      let serverError = new ServerError({
        message: ErEnum.MCLI_MUTUALLY_EXCLUSIVE_FLAGS,
        data: `no-charts and chart-ids`,
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

    let isRepoProd = this.repo === 'production' ? true : false;

    let loginToken = await getLoginToken(this.context);

    let getProjectReqPayload: ToBackendGetProjectRequestPayload = {
      projectId: this.projectId
    };

    let getProjectResp = await mreq<ToBackendGetProjectResponse>({
      loginToken: loginToken,
      pathInfoName: ToBackendRequestInfoNameEnum.ToBackendGetProject,
      payload: getProjectReqPayload,
      host: this.context.config.mproveCliHost
    });

    let getRepoReqPayload: ToBackendGetRepoRequestPayload = {
      projectId: this.projectId,
      isRepoProd: isRepoProd,
      branchId: this.branch,
      envId: this.env,
      isFetch: true
    };

    let getRepoResp = await mreq<ToBackendGetRepoResponse>({
      loginToken: loginToken,
      pathInfoName: ToBackendRequestInfoNameEnum.ToBackendGetRepo,
      payload: getRepoReqPayload,
      host: this.context.config.mproveCliHost
    });

    // let queryIdsWithDuplicates: string[] = [];
    let mconfigParts: {
      mconfigId: string;
      queryId: string;
    }[] = [];

    let chartParts: ChartPart[] = [];

    if (this.noCharts === false) {
      let getChartsReqPayload: ToBackendGetChartsRequestPayload = {
        projectId: this.projectId,
        isRepoProd: isRepoProd,
        branchId: this.branch,
        envId: this.env
      };

      let getChartsResp = await mreq<ToBackendGetChartsResponse>({
        loginToken: loginToken,
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendGetCharts,
        payload: getChartsReqPayload,
        host: this.context.config.mproveCliHost
      });

      let chartIds = this.chartIds?.split(',');

      if (isDefined(chartIds)) {
        chartIds.forEach(x => {
          if (
            getChartsResp.payload.charts
              .map(chart => chart.chartId)
              .indexOf(x) < 0
          ) {
            let serverError = new ServerError({
              message: ErEnum.MCLI_CHART_NOT_FOUND,
              data: { id: x },
              originalError: null
            });
            throw serverError;
          }
        });
      }

      chartParts = getChartsResp.payload.charts
        .filter(
          chartPart =>
            isUndefined(chartIds) || chartIds.indexOf(chartPart.chartId) > -1
        )
        .map(x => {
          let url = getChartUrl({
            host: this.context.config.mproveCliHost,
            orgId: getProjectResp.payload.project.orgId,
            projectId: this.projectId,
            repoId: getRepoResp.payload.repo.repoId,
            branch: this.branch,
            env: this.env,
            chartId: x.chartId,
            timezone: getRepoResp.payload.struct.defaultTimezone
          });

          let chartPart: ChartPart = {
            title: x.title,
            chartId: x.chartId,
            url: url,
            query: { queryId: x.tiles[0].queryId } as Query
          };

          mconfigParts.push({
            mconfigId: x.tiles[0].mconfigId,
            queryId: x.tiles[0].queryId
          });
          // queryIdsWithDuplicates.push(x.tiles[0].queryId);

          return chartPart;
        });
    }

    let dashboardParts: DashboardPart[] = [];

    if (this.noDashboards === false) {
      let getDashboardsReqPayload: ToBackendGetDashboardsRequestPayload = {
        projectId: this.projectId,
        isRepoProd: isRepoProd,
        branchId: this.branch,
        envId: this.env
      };

      let getDashboardsResp = await mreq<ToBackendGetDashboardsResponse>({
        loginToken: loginToken,
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendGetDashboards,
        payload: getDashboardsReqPayload,
        host: this.context.config.mproveCliHost
      });

      let dashboardIds = this.dashboardIds?.split(',');

      if (isDefined(dashboardIds)) {
        dashboardIds.forEach(x => {
          if (
            getDashboardsResp.payload.dashboards
              .map(dashboard => dashboard.dashboardId)
              .indexOf(x) < 0
          ) {
            let serverError = new ServerError({
              message: ErEnum.MCLI_DASHBOARD_NOT_FOUND,
              data: { id: x },
              originalError: null
            });
            throw serverError;
          }
        });
      }

      dashboardParts = getDashboardsResp.payload.dashboards
        .filter(
          dashboard =>
            isUndefined(dashboardIds) ||
            dashboardIds.indexOf(dashboard.dashboardId) > -1
        )
        .map(dashboard => {
          let tileParts: TilePart[] = [];

          dashboard.tiles.forEach(tile => {
            let tilePart: TilePart = {
              title: tile.title,
              query: {
                queryId: tile.queryId
              } as Query
            };

            tileParts.push(tilePart);
            mconfigParts.push({
              mconfigId: tile.mconfigId,
              queryId: tile.queryId
            });
            // queryIdsWithDuplicates.push(tile.queryId);
          });

          let url = getDashboardUrl({
            host: this.context.config.mproveCliHost,
            orgId: getProjectResp.payload.project.orgId,
            projectId: this.projectId,
            repoId: getRepoResp.payload.repo.repoId,
            branch: this.branch,
            env: this.env,
            dashboardId: dashboard.dashboardId,
            timezone: getRepoResp.payload.struct.defaultTimezone
          });

          let dashboardPart: DashboardPart = {
            title: dashboard.title,
            dashboardId: dashboard.dashboardId,
            url: url,
            tiles: tileParts
          };

          return dashboardPart;
        });
    }

    // let uniqueQueryIds = [...new Set(queryIdsWithDuplicates)];

    //
    let getQueriesReqPayloadStart: ToBackendGetQueriesRequestPayload = {
      projectId: this.projectId,
      isRepoProd: isRepoProd,
      branchId: this.branch,
      envId: this.env,
      mconfigIds: mconfigParts.map(x => x.mconfigId)
      // queryIds: uniqueQueryIds
    };

    let getQueriesRespStart = await mreq<ToBackendGetQueriesResponse>({
      loginToken: loginToken,
      pathInfoName: ToBackendRequestInfoNameEnum.ToBackendGetQueries,
      payload: getQueriesReqPayloadStart,
      host: this.context.config.mproveCliHost
    });

    let queriesStart = getQueriesRespStart.payload.queries;
    //

    let runQueriesReqPayload: ToBackendRunQueriesRequestPayload = {
      projectId: this.projectId,
      isRepoProd: isRepoProd,
      branchId: this.branch,
      envId: this.env,
      mconfigIds: mconfigParts.map(x => x.mconfigId),
      // queryIds: uniqueQueryIds,
      poolSize: this.concurrency
    };

    let runQueriesResp = await mreq<ToBackendRunQueriesResponse>({
      loginToken: loginToken,
      pathInfoName: ToBackendRequestInfoNameEnum.ToBackendRunQueries,
      payload: runQueriesReqPayload,
      host: this.context.config.mproveCliHost
    });

    if (this.noCharts === false && isUndefined(this.concurrency)) {
      chartParts.forEach(v => {
        let query = runQueriesResp.payload.runningQueries.find(
          q => q.queryId === v.query.queryId
        );
        v.query = query;
      });
    }

    if (this.noDashboards === false && isUndefined(this.concurrency)) {
      dashboardParts.forEach(dashboardPart => {
        dashboardPart.tiles.forEach(tilePart => {
          let query = runQueriesResp.payload.runningQueries.find(
            q => q.queryId === tilePart.query.queryId
          );
          tilePart.query.status = query.status;
        });
      });
    }

    // let queryIdsToGet: string[] = [...uniqueQueryIds];
    let mconfigPartsToGet = [...mconfigParts];

    let waitQueries: Query[] = [];

    if (this.wait === true) {
      this.sleep = isDefined(this.sleep) ? this.sleep : 3;

      await sleep(this.sleep * 1000);

      // while (queryIdsToGet.length > 0) {
      while (mconfigPartsToGet.length > 0) {
        let getQueriesReqPayload: ToBackendGetQueriesRequestPayload = {
          projectId: this.projectId,
          isRepoProd: isRepoProd,
          branchId: this.branch,
          envId: this.env,
          mconfigIds: mconfigPartsToGet.map(x => x.mconfigId)
          // queryIds: queryIdsToGet
        };

        let getQueriesResp = await mreq<ToBackendGetQueriesResponse>({
          loginToken: loginToken,
          pathInfoName: ToBackendRequestInfoNameEnum.ToBackendGetQueries,
          payload: getQueriesReqPayload,
          host: this.context.config.mproveCliHost
        });

        getQueriesResp.payload.queries.forEach(query => {
          let queryStart = queriesStart.find(y => y.queryId === query.queryId);

          if (
            query.status !== QueryStatusEnum.Running &&
            query.serverTs > queryStart.serverTs
          ) {
            waitQueries.push(query);

            if (this.noCharts === false) {
              chartParts
                .filter(chartPart => chartPart.query.queryId === query.queryId)
                .forEach(x => (x.query = query));
            }

            if (this.noDashboards === false) {
              dashboardParts.forEach(dp => {
                dp.tiles
                  .filter(tilePart => tilePart.query.queryId === query.queryId)
                  .forEach(x => (x.query = query));
              });
            }

            mconfigPartsToGet = mconfigPartsToGet.filter(
              x => x.queryId !== query.queryId
            );
            // queryIdsToGet = queryIdsToGet.filter(id => id !== query.queryId);
          }
        });

        if (mconfigPartsToGet.length > 0) {
          await sleep(this.sleep * 1000);
        }
      }
    }

    let queriesStats = queriesToStats({
      queries:
        this.wait === true
          ? waitQueries
          : runQueriesResp.payload.runningQueries,
      started:
        this.wait === true ? 0 : runQueriesResp.payload.startedQueryIds.length
    });

    let errorCharts: ChartPart[] =
      queriesStats.error === 0
        ? []
        : chartParts
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

    let errorDashboards: DashboardPart[] =
      queriesStats.error === 0
        ? []
        : dashboardParts
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
      log.dashboards = dashboardParts;
    }

    if (this.getCharts === true) {
      log.charts = chartParts;
    }

    log.errorCharts = errorCharts;
    log.errorDashboards = errorDashboards;
    log.queriesStats = queriesStats;

    logToConsoleMcli({
      log: log,
      logLevel: LogLevelEnum.Info,
      context: this.context,
      isJson: this.json
    });
  }
}
