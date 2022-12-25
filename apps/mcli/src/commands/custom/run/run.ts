import { Command, Option } from 'clipanion';
import * as t from 'typanion';
import { apiToBackend } from '~mcli/barrels/api-to-backend';
import { common } from '~mcli/barrels/common';
import { enums } from '~mcli/barrels/enums';
import { getConfig } from '~mcli/config/get.config';
import { getDashboardUrl } from '~mcli/functions/get-dashboard-url';
import { getLoginToken } from '~mcli/functions/get-login-token';
import { queriesToStats } from '~mcli/functions/get-query-stats';
import { getVisualizationUrl } from '~mcli/functions/get-visualization-url';
import { logToConsoleMcli } from '~mcli/functions/log-to-console-mcli';
import { mreq } from '~mcli/functions/mreq';
import { CustomCommand } from '~mcli/models/custom-command';

interface VizPart {
  title: string;
  vizId: string;
  url: string;
  query: common.Query;
}

interface ReportPart {
  title: string;
  query: common.Query;
}

interface DashboardPart {
  title: string;
  dashboardId: string;
  url: string;
  reports: ReportPart[];
}

export class RunCommand extends CustomCommand {
  static paths = [['run']];

  static usage = Command.Usage({
    description: 'Run dashboards and visualizations',
    examples: [
      [
        'Run for Dev repo and wait for completion',
        'mprove run --project-id DXYE72ODCP5LWPWH2EXQ --repo dev --branch main --env prod --wait --get-dashboards --get-vizs'
      ],
      [
        'Run dashboards d1 and d2 for Dev repo',
        'mprove run --project-id DXYE72ODCP5LWPWH2EXQ --repo dev --branch main --env prod --no-vizs --dashboard-ids d1,d2'
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
    validator: t.isEnum(enums.RepoEnum),
    description: `(required, "${enums.RepoEnum.Dev}" or "${enums.RepoEnum.Production}")`
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

  vizIds = Option.String('--viz-ids', {
    description:
      '(optional) Filter visualizations to run by visualization names, separated by comma'
  });

  noDashboards = Option.Boolean('--no-dashboards', false, {
    description: '(default false) Do not run dashboards'
  });

  noVizs = Option.Boolean('--no-vizs', false, {
    description: '(default false) Do not run visualizations'
  });

  getDashboards = Option.Boolean('--get-dashboards', false, {
    description: '(default false), show dashboards in output'
  });

  getVizs = Option.Boolean('--get-vizs', false, {
    description: '(default false), show visualizations in output'
  });

  json = Option.Boolean('--json', false, {
    description: '(default false)'
  });

  envFilePath = Option.String('--env-file-path', {
    description: '(optional) Path to ".env" file'
  });

  async execute() {
    if (common.isUndefined(this.context.config)) {
      this.context.config = getConfig(this.envFilePath);
    }

    this.projectId = this.projectId || this.context.config.mproveCliProjectId;

    if (this.noDashboards === true && this.getDashboards === true) {
      let serverError = new common.ServerError({
        message: common.ErEnum.MCLI_MUTUALLY_EXCLUSIVE_FLAGS,
        data: `no-dashboards and get-dashboards`,
        originalError: null
      });
      throw serverError;
    }

    if (this.noDashboards === true && common.isDefined(this.dashboardIds)) {
      let serverError = new common.ServerError({
        message: common.ErEnum.MCLI_MUTUALLY_EXCLUSIVE_FLAGS,
        data: `no-dashboards and dashboard-ids`,
        originalError: null
      });
      throw serverError;
    }

    if (this.noVizs === true && this.getVizs === true) {
      let serverError = new common.ServerError({
        message: common.ErEnum.MCLI_MUTUALLY_EXCLUSIVE_FLAGS,
        data: `no-vizs and get-vizs`,
        originalError: null
      });
      throw serverError;
    }

    if (this.noVizs === true && common.isDefined(this.vizIds)) {
      let serverError = new common.ServerError({
        message: common.ErEnum.MCLI_MUTUALLY_EXCLUSIVE_FLAGS,
        data: `no-vizs and viz-ids`,
        originalError: null
      });
      throw serverError;
    }

    if (common.isDefined(this.sleep) && this.wait === false) {
      let serverError = new common.ServerError({
        message: common.ErEnum.MCLI_SLEEP_SECONDS_DOES_NOT_WORK_WITHOUT_WAIT,
        originalError: null
      });
      throw serverError;
    }

    let isRepoProd = this.repo === 'production' ? true : false;

    let loginToken = await getLoginToken(this.context);

    let getProjectReqPayload: apiToBackend.ToBackendGetProjectRequestPayload = {
      projectId: this.projectId
    };

    let getProjectResp = await mreq<apiToBackend.ToBackendGetProjectResponse>({
      loginToken: loginToken,
      pathInfoName:
        apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetProject,
      payload: getProjectReqPayload,
      host: this.context.config.mproveCliHost
    });

    let getRepoReqPayload: apiToBackend.ToBackendGetRepoRequestPayload = {
      projectId: this.projectId,
      isRepoProd: isRepoProd,
      branchId: this.branch,
      envId: this.env,
      isFetch: true
    };

    let getRepoResp = await mreq<apiToBackend.ToBackendGetRepoResponse>({
      loginToken: loginToken,
      pathInfoName: apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetRepo,
      payload: getRepoReqPayload,
      host: this.context.config.mproveCliHost
    });

    let queryIdsWithDuplicates: string[] = [];

    let vizParts: VizPart[] = [];

    if (this.noVizs === false) {
      let getVizsReqPayload: apiToBackend.ToBackendGetVizsRequestPayload = {
        projectId: this.projectId,
        isRepoProd: isRepoProd,
        branchId: this.branch,
        envId: this.env
      };

      let getVizsResp = await mreq<apiToBackend.ToBackendGetVizsResponse>({
        loginToken: loginToken,
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetVizs,
        payload: getVizsReqPayload,
        host: this.context.config.mproveCliHost
      });

      let vizIds = this.vizIds?.split(',');

      if (common.isDefined(vizIds)) {
        vizIds.forEach(x => {
          if (
            getVizsResp.payload.vizs
              .map(visualization => visualization.vizId)
              .indexOf(x) < 0
          ) {
            let serverError = new common.ServerError({
              message: common.ErEnum.MCLI_VISUALIZATION_NOT_FOUND,
              data: { id: x },
              originalError: null
            });
            throw serverError;
          }
        });
      }

      vizParts = getVizsResp.payload.vizs
        .filter(
          visualization =>
            common.isUndefined(vizIds) ||
            vizIds.indexOf(visualization.vizId) > -1
        )
        .map(x => {
          let url = getVisualizationUrl({
            host: this.context.config.mproveCliHost,
            orgId: getProjectResp.payload.project.orgId,
            projectId: this.projectId,
            repoId: getRepoResp.payload.repo.repoId,
            branch: this.branch,
            env: this.env,
            vizId: x.vizId
          });

          let vizPart: VizPart = {
            title: x.title,
            vizId: x.vizId,
            url: url,
            query: { queryId: x.reports[0].queryId } as common.Query
          };

          queryIdsWithDuplicates.push(x.reports[0].queryId);

          return vizPart;
        });
    }

    let dashboardParts: DashboardPart[] = [];

    if (this.noDashboards === false) {
      let getDashboardsReqPayload: apiToBackend.ToBackendGetDashboardsRequestPayload =
        {
          projectId: this.projectId,
          isRepoProd: isRepoProd,
          branchId: this.branch,
          envId: this.env
        };

      let getDashboardsResp =
        await mreq<apiToBackend.ToBackendGetDashboardsResponse>({
          loginToken: loginToken,
          pathInfoName:
            apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetDashboards,
          payload: getDashboardsReqPayload,
          host: this.context.config.mproveCliHost
        });

      let dashboardIds = this.dashboardIds?.split(',');

      if (common.isDefined(dashboardIds)) {
        dashboardIds.forEach(x => {
          if (
            getDashboardsResp.payload.dashboards
              .map(dashboard => dashboard.dashboardId)
              .indexOf(x) < 0
          ) {
            let serverError = new common.ServerError({
              message: common.ErEnum.MCLI_DASHBOARD_NOT_FOUND,
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
            common.isUndefined(dashboardIds) ||
            dashboardIds.indexOf(dashboard.dashboardId) > -1
        )
        .map(dashboard => {
          let reportParts: ReportPart[] = [];

          dashboard.reports.forEach(report => {
            let reportPart: ReportPart = {
              title: report.title,
              query: {
                queryId: report.queryId
              } as common.Query
            };

            reportParts.push(reportPart);
            queryIdsWithDuplicates.push(report.queryId);
          });

          let url = getDashboardUrl({
            host: this.context.config.mproveCliHost,
            orgId: getProjectResp.payload.project.orgId,
            projectId: this.projectId,
            repoId: getRepoResp.payload.repo.repoId,
            branch: this.branch,
            env: this.env,
            dashboardId: dashboard.dashboardId
          });

          let dashboardPart: DashboardPart = {
            title: dashboard.title,
            dashboardId: dashboard.dashboardId,
            url: url,
            reports: reportParts
          };

          return dashboardPart;
        });
    }

    let uniqueQueryIds = [...new Set(queryIdsWithDuplicates)];

    //
    let getQueriesReqPayloadStart: apiToBackend.ToBackendGetQueriesRequestPayload =
      {
        projectId: this.projectId,
        isRepoProd: isRepoProd,
        branchId: this.branch,
        envId: this.env,
        queryIds: uniqueQueryIds
      };

    let getQueriesRespStart =
      await mreq<apiToBackend.ToBackendGetQueriesResponse>({
        loginToken: loginToken,
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetQueries,
        payload: getQueriesReqPayloadStart,
        host: this.context.config.mproveCliHost
      });

    let queriesStart = getQueriesRespStart.payload.queries;
    //

    let runQueriesReqPayload: apiToBackend.ToBackendRunQueriesRequestPayload = {
      projectId: this.projectId,
      queryIds: uniqueQueryIds,
      poolSize: this.concurrency
    };

    let runQueriesResp = await mreq<apiToBackend.ToBackendRunQueriesResponse>({
      loginToken: loginToken,
      pathInfoName:
        apiToBackend.ToBackendRequestInfoNameEnum.ToBackendRunQueries,
      payload: runQueriesReqPayload,
      host: this.context.config.mproveCliHost
    });

    if (this.noVizs === false && common.isUndefined(this.concurrency)) {
      vizParts.forEach(v => {
        let query = runQueriesResp.payload.runningQueries.find(
          q => q.queryId === v.query.queryId
        );
        v.query = query;
      });
    }

    if (this.noDashboards === false && common.isUndefined(this.concurrency)) {
      dashboardParts.forEach(dashboardPart => {
        dashboardPart.reports.forEach(reportPart => {
          let query = runQueriesResp.payload.runningQueries.find(
            q => q.queryId === reportPart.query.queryId
          );
          reportPart.query.status = query.status;
        });
      });
    }

    let queryIdsToGet: string[] = [...uniqueQueryIds];

    let waitQueries: common.Query[] = [];

    if (this.wait === true) {
      this.sleep = this.sleep || 3;

      await common.sleep(this.sleep * 1000);

      while (queryIdsToGet.length > 0) {
        let getQueriesReqPayload: apiToBackend.ToBackendGetQueriesRequestPayload =
          {
            projectId: this.projectId,
            isRepoProd: isRepoProd,
            branchId: this.branch,
            envId: this.env,
            queryIds: queryIdsToGet
          };

        let getQueriesResp =
          await mreq<apiToBackend.ToBackendGetQueriesResponse>({
            loginToken: loginToken,
            pathInfoName:
              apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetQueries,
            payload: getQueriesReqPayload,
            host: this.context.config.mproveCliHost
          });

        getQueriesResp.payload.queries.forEach(query => {
          let queryStart = queriesStart.find(y => y.queryId === query.queryId);

          if (
            query.status !== common.QueryStatusEnum.Running &&
            query.serverTs > queryStart.serverTs
          ) {
            waitQueries.push(query);

            if (this.noVizs === false) {
              vizParts
                .filter(vizPart => vizPart.query.queryId === query.queryId)
                .forEach(x => (x.query = query));
            }

            if (this.noDashboards === false) {
              dashboardParts.forEach(dp => {
                dp.reports
                  .filter(
                    reportPart => reportPart.query.queryId === query.queryId
                  )
                  .forEach(x => (x.query = query));
              });
            }

            queryIdsToGet = queryIdsToGet.filter(id => id !== query.queryId);
          }
        });

        if (queryIdsToGet.length > 0) {
          await common.sleep(this.sleep * 1000);
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

    let errorVisualizations: VizPart[] =
      queriesStats.error === 0
        ? []
        : vizParts
            .filter(x => x.query.status === common.QueryStatusEnum.Error)
            .map(v => ({
              title: v.title,
              vizId: v.vizId,
              url: v.url,
              query: {
                lastErrorMessage: v.query.lastErrorMessage,
                status: v.query.status,
                queryId: v.query.queryId
              } as common.Query
            }));

    let errorDashboards: DashboardPart[] =
      queriesStats.error === 0
        ? []
        : dashboardParts
            .filter(
              x =>
                x.reports.filter(
                  y => y.query.status === common.QueryStatusEnum.Error
                ).length > 0
            )
            .map(d => ({
              title: d.title,
              dashboardId: d.dashboardId,
              url: d.url,
              reports: d.reports
                .filter(q => q.query.status === common.QueryStatusEnum.Error)
                .map(r => ({
                  title: r.title,
                  query: {
                    lastErrorMessage: r.query.lastErrorMessage,
                    status: r.query.status,
                    queryId: r.query.queryId
                  } as common.Query
                }))
            }));

    let log: any = {};

    if (this.getDashboards === true) {
      log.dashboards = dashboardParts;
    }

    if (this.getVizs === true) {
      log.visualizations = vizParts;
    }

    log.errorVisualizations = errorVisualizations;
    log.errorDashboards = errorDashboards;
    log.queriesStats = queriesStats;

    logToConsoleMcli({
      log: log,
      logLevel: common.LogLevelEnum.Info,
      context: this.context,
      isJson: this.json
    });
  }
}
