import { Command, Option } from 'clipanion';
import * as t from 'typanion';
import { apiToBackend } from '~mcli/barrels/api-to-backend';
import { common } from '~mcli/barrels/common';
import { enums } from '~mcli/barrels/enums';
import { getConfig } from '~mcli/config/get.config';
import { getLoginToken } from '~mcli/functions/get-login-token';
import { queriesToStats } from '~mcli/functions/get-query-stats';
import { logToConsoleMcli } from '~mcli/functions/log-to-console-mcli';
import { mreq } from '~mcli/functions/mreq';
import { CustomCommand } from '~mcli/models/custom-command';

interface VizPart {
  vizId: string;
  title: string;
  query: common.Query;
}

interface ReportPart {
  title: string;
  query: common.Query;
}

interface DashboardPart {
  title: string;
  dashboardId: string;
  reports: ReportPart[];
}

export class RunCommand extends CustomCommand {
  static paths = [['run']];

  static usage = Command.Usage({
    description: 'Run dashboards and visualizations',
    examples: [
      [
        'Run for Dev repo and wait for completion',
        'mprove run -p DXYE72ODCP5LWPWH2EXQ --repo dev --branch main --env prod --wait'
      ],
      [
        'Run dashboards d1 and d2 for Dev repo',
        'mprove run -p DXYE72ODCP5LWPWH2EXQ --repo dev --branch main --env prod --no-vizs --dashboard-ids d1,d2'
      ],
      [
        'Run for Production repo',
        'mprove run -p DXYE72ODCP5LWPWH2EXQ --repo production --branch main --env prod'
      ]
    ]
  });

  projectId = Option.String('-p', {
    required: true,
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

  noDashboards = Option.Boolean('--no-dashboards', false, {
    description: '(default false) Do not run dashboards'
  });

  noVizs = Option.Boolean('--no-vizs', false, {
    description: '(default false) Do not run visualizations'
  });

  dashboardIds = Option.String('--dashboard-ids', {
    description:
      '(optional) Filter dashboards to run by dashboard names, separated by comma'
  });

  vizIds = Option.String('--viz-ids', {
    description:
      '(optional) Filter visualizations to run by visualization names, separated by comma'
  });

  wait = Option.Boolean('--wait', false, {
    description: '(default false) Wait for completion'
  });

  sleepSeconds = Option.String('--sleep-seconds', '3', {
    validator: t.isNumber(),
    description: '(default 3) Sleep time between attempts to get results'
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

  async execute() {
    if (common.isUndefined(this.context.config)) {
      this.context.config = getConfig();
    }

    let isRepoProd = this.repo === 'production' ? true : false;

    let loginToken = await getLoginToken(this.context);

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
          let vizPart: VizPart = {
            title: x.title,
            vizId: x.vizId,
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

          let dashboardPart: DashboardPart = {
            title: dashboard.title,
            dashboardId: dashboard.dashboardId,
            reports: reportParts
          };

          return dashboardPart;
        });
    }

    let uniqueQueryIds = [...new Set(queryIdsWithDuplicates)];

    let runQueriesReqPayload: apiToBackend.ToBackendRunQueriesRequestPayload = {
      projectId: this.projectId,
      queryIds: uniqueQueryIds
    };

    let runQueriesResp = await mreq<apiToBackend.ToBackendRunQueriesResponse>({
      loginToken: loginToken,
      pathInfoName:
        apiToBackend.ToBackendRequestInfoNameEnum.ToBackendRunQueries,
      payload: runQueriesReqPayload,
      host: this.context.config.mproveCliHost
    });

    if (this.noVizs === false) {
      vizParts.forEach(v => {
        let query = runQueriesResp.payload.runningQueries.find(
          q => q.queryId === v.query.queryId
        );
        v.query = query;
      });
    }

    if (this.noDashboards === false) {
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

    if (this.wait === true) {
      await common.sleep(this.sleepSeconds * 1000);

      while (queryIdsToGet.length > 0) {
        let getQueriesReqPayload: apiToBackend.ToBackendGetQueriesRequestPayload =
          {
            projectId: this.projectId,
            isRepoProd: isRepoProd,
            branchId: this.branch,
            envId: this.env,
            queryIds: uniqueQueryIds
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
          if (query.status !== common.QueryStatusEnum.Running) {
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
          await common.sleep(this.sleepSeconds * 1000);
        }
      }
    }

    let reportParts = [].concat(...dashboardParts.map(dp => dp.reports));

    let queries = uniqueQueryIds.map(x => {
      let vizPart = vizParts.find(vp => vp.query.queryId === x);

      if (common.isDefined(vizPart)) {
        return vizPart.query;
      } else {
        let reportPart = reportParts.find(rp => rp.query.queryId === x);
        return reportPart.query;
      }
    });

    let queriesStats = queriesToStats(queries);

    let errorVisualizations: VizPart[] =
      queriesStats.error === 0
        ? []
        : vizParts
            .filter(x => x.query.status === common.QueryStatusEnum.Error)
            .map(v => ({
              vizId: v.vizId,
              title: v.title,
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
              dashboardId: d.dashboardId,
              title: d.title,
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

    let log: any = {
      queriesStats: queriesStats
    };

    if (errorVisualizations.length > 0) {
      log.errorVisualizations = errorVisualizations;
    }

    if (errorDashboards.length > 0) {
      log.errorDashboards = errorDashboards;
    }

    if (this.getDashboards === true) {
      log.dashboards = dashboardParts;
    }

    if (this.getVizs === true) {
      log.visualizations = vizParts;
    }

    logToConsoleMcli({
      log: log,
      logLevel: common.LogLevelEnum.Info,
      context: this.context,
      isJson: this.json
    });
  }
}
