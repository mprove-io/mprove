import { Command, Option } from 'clipanion';
import * as t from 'typanion';
import { apiToBackend } from '~mcli/barrels/api-to-backend';
import { common } from '~mcli/barrels/common';
import { enums } from '~mcli/barrels/enums';
import { getConfig } from '~mcli/config/get.config';
import { queriesToStats } from '~mcli/functions/get-query-stats';
import { logToConsoleMcli } from '~mcli/functions/log-to-console-mcli';
import { mreq } from '~mcli/functions/mreq';
import { CustomCommand } from '~mcli/models/custom-command';

interface ReportPart {
  title: string;
  query: common.Query;
}

interface DashboardPart {
  title: string;
  dashboardId: string;
  reports: ReportPart[];
}

export class RunDashboardsCommand extends CustomCommand {
  static paths = [['run', 'dashboards']];

  static usage = Command.Usage({
    description: 'Run dashboards',
    examples: [
      [
        'Run dashboards for Production repo',
        'mprove run dashboards --projectId DXYE72ODCP5LWPWH2EXQ --repo production --branch main --env prod'
      ],
      [
        'Run dashboards for Dev repo',
        'mprove run dashboards --projectId DXYE72ODCP5LWPWH2EXQ --repo dev --branch main --env prod'
      ],
      [
        'Run dashboards d1 and d2 for Dev repo',
        'mprove run dashboards --projectId DXYE72ODCP5LWPWH2EXQ --repo dev --branch main --env prod --ids d1,d2'
      ]
    ]
  });

  projectId = Option.String('-p,--projectId', {
    required: true,
    description: '(required) Project Id'
  });

  repo = Option.String('-r,--repo', {
    required: true,
    validator: t.isEnum(enums.RepoEnum),
    description:
      '(required, "dev" or "production") Dev or Production repository'
  });

  branchId = Option.String('-b,--branch', {
    required: true,
    description: '(required) Git Branch'
  });

  envId = Option.String('-e,--env', {
    required: true,
    description: '(required) Environment'
  });

  ids = Option.String('--ids', {
    description:
      '(optional) Run only dashboards with selected Ids (dashboard names), separated by comma'
  });

  verbose = Option.Boolean('-v,--verbose', false, {
    description: '(default false)'
  });

  json = Option.Boolean('-j,--json', false, {
    description: '(default false)'
  });

  wait = Option.Boolean('-w,--wait', false, {
    description: '(default false) Wait for results'
  });

  seconds = Option.String('-s,--seconds', '3', {
    validator: t.isNumber(),
    description: '(default 3) Sleep time between getting results'
  });

  async execute() {
    if (common.isUndefined(this.context.config)) {
      this.context.config = getConfig();
    }

    let isRepoProd = this.repo === 'production' ? true : false;

    let loginUserReqPayload: apiToBackend.ToBackendLoginUserRequestPayload = {
      email: this.context.config.mproveCliEmail,
      password: this.context.config.mproveCliPassword
    };

    let loginUserResp = await mreq<apiToBackend.ToBackendLoginUserResponse>({
      pathInfoName:
        apiToBackend.ToBackendRequestInfoNameEnum.ToBackendLoginUser,
      payload: loginUserReqPayload,
      config: this.context.config
    });

    let getDashboardsReqPayload: apiToBackend.ToBackendGetDashboardsRequestPayload =
      {
        projectId: this.projectId,
        isRepoProd: isRepoProd,
        branchId: this.branchId,
        envId: this.envId
      };

    let getDashboardsResp =
      await mreq<apiToBackend.ToBackendGetDashboardsResponse>({
        token: loginUserResp.payload.token,
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetDashboards,
        payload: getDashboardsReqPayload,
        config: this.context.config
      });

    let ids = this.ids?.split(',');

    if (common.isDefined(ids)) {
      ids.forEach(x => {
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

    let queryIdsWithDuplicates: string[] = [];

    let dashboardParts: DashboardPart[] = getDashboardsResp.payload.dashboards
      .filter(
        dashboard =>
          common.isUndefined(ids) || ids.indexOf(dashboard.dashboardId) > -1
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

    let uniqueQueryIds = [...new Set(queryIdsWithDuplicates)];

    let runQueriesReqPayload: apiToBackend.ToBackendRunQueriesRequestPayload = {
      projectId: this.projectId,
      queryIds: uniqueQueryIds
    };

    let runQueriesResp = await mreq<apiToBackend.ToBackendRunQueriesResponse>({
      token: loginUserResp.payload.token,
      pathInfoName:
        apiToBackend.ToBackendRequestInfoNameEnum.ToBackendRunQueries,
      payload: runQueriesReqPayload,
      config: this.context.config
    });

    dashboardParts.forEach(dashboardPart => {
      dashboardPart.reports.forEach(reportPart => {
        let query = runQueriesResp.payload.runningQueries.find(
          q => q.queryId === reportPart.query.queryId
        );
        reportPart.query.status = query.status;
      });
    });

    let queryIdsToGet: string[] = [...uniqueQueryIds];

    if (this.wait === true) {
      await common.sleep(this.seconds * 1000);

      while (queryIdsToGet.length > 0) {
        let getQueriesReqPayload: apiToBackend.ToBackendGetQueriesRequestPayload =
          {
            projectId: this.projectId,
            isRepoProd: isRepoProd,
            branchId: this.branchId,
            envId: this.envId,
            queryIds: uniqueQueryIds
          };

        let getQueriesResp =
          await mreq<apiToBackend.ToBackendGetQueriesResponse>({
            token: loginUserResp.payload.token,
            pathInfoName:
              apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetQueries,
            payload: getQueriesReqPayload,
            config: this.context.config
          });

        getQueriesResp.payload.queries.forEach(query => {
          if (query.status !== common.QueryStatusEnum.Running) {
            dashboardParts.forEach(dp => {
              dp.reports
                .filter(
                  reportPart => reportPart.query.queryId === query.queryId
                )
                .forEach(x => (x.query = query));
            });

            queryIdsToGet = queryIdsToGet.filter(id => id !== query.queryId);
          }
        });

        if (queryIdsToGet.length > 0) {
          await common.sleep(this.seconds * 1000);
        }
      }
    }

    let reportParts = [].concat(...dashboardParts.map(dp => dp.reports));

    let queries = uniqueQueryIds.map(
      x => reportParts.find(rp => rp.query.queryId === x).query
    );

    let queriesStats = queriesToStats(queries);

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

    if (errorDashboards.length > 0) {
      log.errorDashboards = errorDashboards;
    }

    if (this.verbose === true) {
      log.dashboards = dashboardParts;
    }

    logToConsoleMcli({
      log: log,
      logLevel: common.LogLevelEnum.Info,
      context: this.context,
      isJson: this.json
    });
  }
}
