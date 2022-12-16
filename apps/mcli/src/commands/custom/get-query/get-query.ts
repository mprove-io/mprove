import { Command, Option } from 'clipanion';
import * as t from 'typanion';
import { apiToBackend } from '~mcli/barrels/api-to-backend';
import { common } from '~mcli/barrels/common';
import { enums } from '~mcli/barrels/enums';
import { getConfig } from '~mcli/config/get.config';
import { getLoginToken } from '~mcli/functions/get-login-token';
import { logToConsoleMcli } from '~mcli/functions/log-to-console-mcli';
import { mreq } from '~mcli/functions/mreq';
import { CustomCommand } from '~mcli/models/custom-command';

interface VizPartQ {
  vizId: string;
  title: string;
  query: QueryPartQ;
}

interface DashboardPartQ {
  title: string;
  dashboardId: string;
  reports: ReportPartQ[];
}

interface ReportPartQ {
  title: string;
  query: QueryPartQ;
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
}

export class GetQueryCommand extends CustomCommand {
  static paths = [['get-query']];

  static usage = Command.Usage({
    description: 'Get query',
    examples: [
      [
        'Get query for Dev repo dashboard',
        'mprove get-query -p DXYE72ODCP5LWPWH2EXQ --repo dev --branch main --env prod --dashboard-id d1'
      ],
      [
        'Get query for Dev repo visualization',
        'mprove get-query -p DXYE72ODCP5LWPWH2EXQ --repo dev --branch main --env prod --visualization-id v1'
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

  dashboardId = Option.String('--dashboard-id', {
    description: '(optional) Dashboard Id (name)'
  });

  reportIndex = Option.String('--report-index', {
    validator: t.isNumber(),
    description: '(optional) Dashboard Report Index starting with 0'
  });

  visualizationId = Option.String('--visualization-id', {
    description: '(optional) Visualization Id (name)'
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

  async execute() {
    if (common.isUndefined(this.context.config)) {
      this.context.config = getConfig();
    }

    let isRepoProd = this.repo === 'production' ? true : false;

    let loginToken = await getLoginToken(this.context);

    let vizPartQ: VizPartQ;

    if (common.isDefined(this.visualizationId)) {
      let getVizReqPayload: apiToBackend.ToBackendGetVizRequestPayload = {
        projectId: this.projectId,
        isRepoProd: isRepoProd,
        branchId: this.branch,
        envId: this.env,
        vizId: this.visualizationId
      };

      let getVizResp = await mreq<apiToBackend.ToBackendGetVizResponse>({
        loginToken: loginToken,
        pathInfoName: apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetViz,
        payload: getVizReqPayload,
        host: this.context.config.mproveCliHost
      });

      let vizX = getVizResp.payload.viz;
      let reportX = vizX.reports[0];

      let queryPartQ: QueryPartQ = {
        connectionId: reportX.query.connectionId,
        connectionType: reportX.query.connectionType,
        queryId: reportX.query.queryId,
        status: reportX.query.status,
        lastRunBy: reportX.query.lastRunBy,
        lastRunTs: reportX.query.lastRunTs,
        lastCancelTs: reportX.query.lastCancelTs,
        lastCompleteTs: reportX.query.lastCompleteTs,
        lastCompleteDuration: reportX.query.lastCompleteDuration,
        lastErrorMessage: reportX.query.lastErrorMessage,
        lastErrorTs: reportX.query.lastErrorTs,
        data: undefined,
        sql: undefined,
        sqlArray: undefined
      };

      if (this.getData) {
        queryPartQ.data = reportX.query.data;
      }

      if (this.getSql) {
        let sqlArray = reportX.query.sql.split('\n');
        queryPartQ.sql = sqlArray.join('');
        queryPartQ.sqlArray = sqlArray;
      }

      vizPartQ = {
        vizId: vizX.vizId,
        title: reportX.mconfig.chart.title,
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
          dashboardId: this.dashboardId
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

      let reportPartQs = dashboardX.reports
        .filter((rep, i) => {
          if (common.isDefined(this.reportIndex)) {
            return this.reportIndex === i;
          }

          return true;
        })
        .map(reportX => {
          let queryPartQ: QueryPartQ = {
            connectionId: reportX.query.connectionId,
            connectionType: reportX.query.connectionType,
            queryId: reportX.query.queryId,
            status: reportX.query.status,
            lastRunBy: reportX.query.lastRunBy,
            lastRunTs: reportX.query.lastRunTs,
            lastCancelTs: reportX.query.lastCancelTs,
            lastCompleteTs: reportX.query.lastCompleteTs,
            lastCompleteDuration: reportX.query.lastCompleteDuration,
            lastErrorMessage: reportX.query.lastErrorMessage,
            lastErrorTs: reportX.query.lastErrorTs,
            data: undefined,
            sql: undefined,
            sqlArray: undefined
          };

          if (this.getData) {
            queryPartQ.data = reportX.query.data;
          }

          if (this.getSql) {
            let sqlArray = reportX.query.sql.split('\n');
            queryPartQ.sql = sqlArray.join('');
            queryPartQ.sqlArray = sqlArray;
          }

          let reportPartQ: ReportPartQ = {
            title: reportX.mconfig.chart.title,
            query: queryPartQ
          };

          return reportPartQ;
        });

      dashboardPartQ = {
        dashboardId: dashboardX.dashboardId,
        title: dashboardX.title,
        reports: reportPartQs
      };
    }

    let log: any = {};

    if (common.isDefined(this.dashboardId)) {
      log.dashboard = dashboardPartQ;
    }

    if (common.isDefined(this.visualizationId)) {
      log.visualization = vizPartQ;
    }

    logToConsoleMcli({
      log: log,
      logLevel: common.LogLevelEnum.Info,
      context: this.context,
      isJson: this.json
    });
  }
}
