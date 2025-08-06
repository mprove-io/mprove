import { Command, Option } from 'clipanion';
import * as t from 'typanion';
import { apiToBackend } from '~mcli/barrels/api-to-backend';
import { common } from '~mcli/barrels/common';
import { enums } from '~mcli/barrels/enums';
import { getConfig } from '~mcli/config/get.config';
import { getChartUrl } from '~mcli/functions/get-chart-url';
import { getDashboardUrl } from '~mcli/functions/get-dashboard-url';
import { getLoginToken } from '~mcli/functions/get-login-token';
import { getReportUrl } from '~mcli/functions/get-report-url';
import { logToConsoleMcli } from '~mcli/functions/log-to-console-mcli';
import { mreq } from '~mcli/functions/mreq';
import { CustomCommand } from '~mcli/models/custom-command';

interface ChartPartQ {
  title: string;
  chartId: string;
  url: string;
  query: QueryPartQ;
}

interface DashboardPartQ {
  title: string;
  dashboardId: string;
  url: string;
  tiles: TilePartQ[];
}

interface TilePartQ {
  title: string;
  query: QueryPartQ;
}

interface ReportPartQ {
  title: string;
  reportId: string;
  url: string;
  rows: RowPartQ[];
}

interface RowPartQ {
  rowId: string;
  name: string;
  rowType: common.RowTypeEnum;
  metricId: string;
  formula: string;
  parameters: common.Parameter[];
  query: QueryPartQ;
  records: any[];
}

interface QueryPartQ {
  // projectId: string;
  // envId: string;
  connectionId: string;
  connectionType: common.ConnectionTypeEnum;
  queryId: string;
  status: common.QueryStatusEnum;
  lastRunBy: string;
  lastRunTs: number;
  lastCancelTs: number;
  lastCompleteTs: number;
  lastCompleteDuration: number;
  lastErrorMessage: string;
  lastErrorTs: number;
  // queryJobId: string;
  // bigqueryQueryJobId: string;
  // bigqueryConsecutiveErrorsGetJob: number;
  // bigqueryConsecutiveErrorsGetResults: number;
  // serverTs: number;
  data: any;
  sql: string;
  sqlArray: string[];
  apiMethod: string;
  apiUrl: string;
  apiBody: string;
}

export class GetQueryCommand extends CustomCommand {
  static paths = [['get-query']];

  static usage = Command.Usage({
    description: 'Get query',
    examples: [
      [
        'Get query for Dev repo Chart',
        'mprove get-query --project-id DXYE72ODCP5LWPWH2EXQ --repo dev --branch main --env prod --chart-id v1 --get-sql --get-data'
      ],
      [
        'Get query for Dev repo Dashboard',
        'mprove get-query --project-id DXYE72ODCP5LWPWH2EXQ --repo dev --branch main --env prod --dashboard-id d1 --get-sql --get-data'
      ],
      [
        'Get query for Dev repo Report',
        'mprove get-query --project-id DXYE72ODCP5LWPWH2EXQ --repo dev --branch main --env prod --report-id r1 --get-sql --get-data'
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

  timeSpec = Option.String('--timeSpec', 'days', {
    description:
      '(default "days") "minutes" | "hours" | "days" | "weeks" | "months" | "quarters" | "years"'
  });

  timeRange = Option.String(
    '--timeRange',
    'last 5 days complete plus current', // TODO: new fractions 2
    {
      description:
        '(default "last 5 days complete plus current") Ts Filter Expression'
    }
  );

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

  async execute() {
    if (common.isUndefined(this.context.config)) {
      this.context.config = getConfig(this.envFilePath);
    }

    this.projectId = this.projectId || this.context.config.mproveCliProjectId;

    if (common.isUndefined(this.projectId)) {
      let serverError = new common.ServerError({
        message: common.ErEnum.MCLI_PROJECT_ID_IS_NOT_DEFINED,
        originalError: null
      });
      throw serverError;
    }

    if (
      common.isDefined(this.dashboardId) &&
      common.isDefined(this.chartId) &&
      common.isDefined(this.reportId)
    ) {
      let serverError = new common.ServerError({
        message: common.ErEnum.MCLI_MUTUALLY_EXCLUSIVE_FLAGS,
        data: `dashboard-id, chart-id, report-id`,
        originalError: null
      });
      throw serverError;
    }

    if (
      common.isUndefined(this.dashboardId) &&
      common.isUndefined(this.chartId) &&
      common.isUndefined(this.reportId)
    ) {
      let serverError = new common.ServerError({
        message:
          common.ErEnum
            .MCLI_DASHBOARD_ID_CHART_ID_AND_REPORT_ID_ARE_NOT_DEFINED,
        originalError: null
      });
      throw serverError;
    }

    if (
      common.isDefined(this.tileIndex) &&
      common.isUndefined(this.dashboardId)
    ) {
      let serverError = new common.ServerError({
        message:
          common.ErEnum.MCLI_TILE_INDEX_DOES_NOT_WORK_WITHOUT_DASHBOARD_ID,
        originalError: null
      });
      throw serverError;
    }

    if (common.isDefined(this.rowId) && common.isUndefined(this.reportId)) {
      let serverError = new common.ServerError({
        message: common.ErEnum.MCLI_ROW_ID_DOES_NOT_WORK_WITHOUT_REPORT_ID,
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

    let chartPartQ: ChartPartQ;

    if (common.isDefined(this.chartId)) {
      let getChartReqPayload: apiToBackend.ToBackendGetChartRequestPayload = {
        projectId: this.projectId,
        isRepoProd: isRepoProd,
        branchId: this.branch,
        envId: this.env,
        chartId: this.chartId,
        timezone: this.timezone
      };

      let getChartResp = await mreq<apiToBackend.ToBackendGetChartResponse>({
        loginToken: loginToken,
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetChart,
        payload: getChartReqPayload,
        host: this.context.config.mproveCliHost
      });

      let chartX = getChartResp.payload.chart;
      let tileX = chartX.tiles[0];

      let queryPartQ: QueryPartQ = {
        connectionId: tileX.query.connectionId,
        connectionType: tileX.query.connectionType,
        queryId: tileX.query.queryId,
        status: tileX.query.status,
        lastRunBy: tileX.query.lastRunBy,
        lastRunTs: tileX.query.lastRunTs,
        lastCancelTs: tileX.query.lastCancelTs,
        lastCompleteTs: tileX.query.lastCompleteTs,
        lastCompleteDuration: tileX.query.lastCompleteDuration,
        lastErrorMessage: tileX.query.lastErrorMessage,
        lastErrorTs: tileX.query.lastErrorTs,
        data: undefined,
        sql: undefined,
        sqlArray: undefined,
        apiMethod: undefined,
        apiUrl: undefined,
        apiBody: undefined
      };

      if (this.getData) {
        queryPartQ.data = tileX.query.data;
      }

      if (this.getSql) {
        // TODO: getApi
        queryPartQ.sql = tileX.query.sql;
      }

      let url = getChartUrl({
        host: this.context.config.mproveCliHost,
        orgId: getProjectResp.payload.project.orgId,
        projectId: this.projectId,
        repoId: getRepoResp.payload.repo.repoId,
        branch: this.branch,
        env: this.env,
        chartId: chartX.chartId,
        timezone: this.timezone
      });

      chartPartQ = {
        title: tileX.mconfig.chart.title,
        chartId: chartX.chartId,
        url: url,
        query: queryPartQ
      };
    }

    let dashboardPartQ: DashboardPartQ;

    if (common.isDefined(this.dashboardId)) {
      let getDashboardReqPayload: apiToBackend.ToBackendGetDashboardRequestPayload =
        {
          projectId: this.projectId,
          isRepoProd: isRepoProd,
          branchId: this.branch,
          envId: this.env,
          dashboardId: this.dashboardId,
          timezone: this.timezone
        };

      let getDashboardResp =
        await mreq<apiToBackend.ToBackendGetDashboardResponse>({
          loginToken: loginToken,
          pathInfoName:
            apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetDashboard,
          payload: getDashboardReqPayload,
          host: this.context.config.mproveCliHost
        });

      let dashboardX = getDashboardResp.payload.dashboard;

      let tilePartQs = dashboardX.tiles
        .filter((tile, i) => {
          if (common.isDefined(this.tileIndex)) {
            return i === this.tileIndex;
          }

          return true;
        })
        .map(tileX => {
          let queryPartQ: QueryPartQ = {
            connectionId: tileX.query.connectionId,
            connectionType: tileX.query.connectionType,
            queryId: tileX.query.queryId,
            status: tileX.query.status,
            lastRunBy: tileX.query.lastRunBy,
            lastRunTs: tileX.query.lastRunTs,
            lastCancelTs: tileX.query.lastCancelTs,
            lastCompleteTs: tileX.query.lastCompleteTs,
            lastCompleteDuration: tileX.query.lastCompleteDuration,
            lastErrorMessage: tileX.query.lastErrorMessage,
            lastErrorTs: tileX.query.lastErrorTs,
            data: undefined,
            sql: undefined,
            sqlArray: undefined,
            apiMethod: undefined,
            apiUrl: undefined,
            apiBody: undefined
          };

          if (this.getData) {
            queryPartQ.data = tileX.query.data;
          }

          if (this.getSql) {
            // TODO: getApi
            queryPartQ.sql = tileX.query.sql;
          }

          let tilePartQ: TilePartQ = {
            title: tileX.mconfig.chart.title,
            query: queryPartQ
          };

          return tilePartQ;
        });

      let url = getDashboardUrl({
        host: this.context.config.mproveCliHost,
        orgId: getProjectResp.payload.project.orgId,
        projectId: this.projectId,
        repoId: getRepoResp.payload.repo.repoId,
        branch: this.branch,
        env: this.env,
        dashboardId: dashboardX.dashboardId,
        timezone: this.timezone
      });

      dashboardPartQ = {
        title: dashboardX.title,
        dashboardId: dashboardX.dashboardId,
        url: url,
        tiles: tilePartQs
      };
    }

    let reportPartQ: ReportPartQ;

    if (common.isDefined(this.reportId)) {
      let getRepReqPayload: apiToBackend.ToBackendGetReportRequestPayload = {
        projectId: this.projectId,
        isRepoProd: isRepoProd,
        branchId: this.branch,
        envId: this.env,
        reportId: this.reportId,
        timezone: this.timezone,
        timeSpec: this.timeSpec as common.TimeSpecEnum,
        timeRangeFractionBrick: this.timeRange
      };

      let getRepResp = await mreq<apiToBackend.ToBackendGetReportResponse>({
        loginToken: loginToken,
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetReport,
        payload: getRepReqPayload,
        host: this.context.config.mproveCliHost
      });

      let repX = getRepResp.payload.report;

      let rowPartQs = repX.rows
        .filter(row => {
          if (common.isDefined(this.rowId)) {
            return row.rowId === this.rowId;
          }

          return true;
        })
        .map(row => {
          let queryPartQ: QueryPartQ;

          if (row.rowType === common.RowTypeEnum.Metric) {
            queryPartQ = {
              connectionId: row.query.connectionId,
              connectionType: row.query.connectionType,
              queryId: row.query.queryId,
              status: row.query.status,
              lastRunBy: row.query.lastRunBy,
              lastRunTs: row.query.lastRunTs,
              lastCancelTs: row.query.lastCancelTs,
              lastCompleteTs: row.query.lastCompleteTs,
              lastCompleteDuration: row.query.lastCompleteDuration,
              lastErrorMessage: row.query.lastErrorMessage,
              lastErrorTs: row.query.lastErrorTs,
              data: undefined,
              sql: undefined,
              sqlArray: undefined,
              apiMethod: undefined,
              apiUrl: undefined,
              apiBody: undefined
            };

            if (this.getData) {
              queryPartQ.data = row.query?.data;
            }

            if (this.getSql) {
              // TODO: getApi
              queryPartQ.sql = row.query?.sql;
            }
          }

          let rowPartQ: RowPartQ = {
            rowId: row.rowId,
            name:
              row.rowType === common.RowTypeEnum.Metric
                ? `${row.partNodeLabel} ${row.partFieldLabel} by ${row.timeNodeLabel} ${row.timeFieldLabel} - ${row.topLabel}`
                : row.name,
            rowType: row.rowType,
            metricId: row.metricId,
            formula: row.formula,
            parameters: row.parameters,
            query: queryPartQ,
            records: this.getData === true ? row.records : undefined
          };

          return rowPartQ;
        });

      let url = getReportUrl({
        host: this.context.config.mproveCliHost,
        orgId: getProjectResp.payload.project.orgId,
        projectId: this.projectId,
        repoId: getRepoResp.payload.repo.repoId,
        branch: this.branch,
        env: this.env,
        reportId: repX.reportId,
        timezone: this.timezone,
        timeSpec: this.timeSpec,
        timeRange: this.timeRange
      });

      reportPartQ = {
        title: repX.title,
        reportId: repX.reportId,
        url: url,
        rows: rowPartQs
      };
    }

    let log: any = {};

    if (common.isDefined(this.chartId)) {
      log.chart = chartPartQ;
    }

    if (common.isDefined(this.dashboardId)) {
      log.dashboard = dashboardPartQ;
    }

    if (common.isDefined(this.reportId)) {
      log.report = reportPartQ;
    }

    logToConsoleMcli({
      log: log,
      logLevel: common.LogLevelEnum.Info,
      context: this.context,
      isJson: this.json
    });
  }
}
