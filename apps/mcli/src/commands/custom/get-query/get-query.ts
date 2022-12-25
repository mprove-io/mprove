import { Command, Option } from 'clipanion';
import * as t from 'typanion';
import { apiToBackend } from '~mcli/barrels/api-to-backend';
import { common } from '~mcli/barrels/common';
import { enums } from '~mcli/barrels/enums';
import { getConfig } from '~mcli/config/get.config';
import { getDashboardUrl } from '~mcli/functions/get-dashboard-url';
import { getLoginToken } from '~mcli/functions/get-login-token';
import { getVisualizationUrl } from '~mcli/functions/get-visualization-url';
import { logToConsoleMcli } from '~mcli/functions/log-to-console-mcli';
import { mreq } from '~mcli/functions/mreq';
import { CustomCommand } from '~mcli/models/custom-command';

interface VizPartQ {
  title: string;
  vizId: string;
  url: string;
  query: QueryPartQ;
}

interface DashboardPartQ {
  title: string;
  dashboardId: string;
  url: string;
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
        'Get query for Dev repo visualization',
        'mprove get-query --project-id DXYE72ODCP5LWPWH2EXQ --repo dev --branch main --env prod --viz-id v1 --get-sql --get-data'
      ],
      [
        'Get query for Dev repo dashboard',
        'mprove get-query --project-id DXYE72ODCP5LWPWH2EXQ --repo dev --branch main --env prod --dashboard-id d1 --get-sql --get-data'
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
    description: '(dashboard-id or viz-id required) Dashboard Id (name)'
  });

  reportIndex = Option.String('--report-index', {
    validator: t.isNumber(),
    description: '(optional) Dashboard Report Index starting with 0'
  });

  vizId = Option.String('--viz-id', {
    description: '(dashboard-id or viz-id required) Visualization Id (name)'
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

  async execute() {
    if (common.isUndefined(this.context.config)) {
      this.context.config = getConfig(this.envFilePath);
    }

    this.projectId = this.projectId || this.context.config.mproveCliProjectId;

    if (common.isDefined(this.dashboardId) && common.isDefined(this.vizId)) {
      let serverError = new common.ServerError({
        message: common.ErEnum.MCLI_MUTUALLY_EXCLUSIVE_FLAGS,
        data: `dashboard-id and viz-id`,
        originalError: null
      });
      throw serverError;
    }

    if (
      common.isUndefined(this.dashboardId) &&
      common.isUndefined(this.vizId)
    ) {
      let serverError = new common.ServerError({
        message: common.ErEnum.MCLI_DASHBOARD_ID_AND_VIZ_ID_ARE_NOT_DEFINED,
        originalError: null
      });
      throw serverError;
    }

    if (
      common.isDefined(this.reportIndex) &&
      common.isUndefined(this.dashboardId)
    ) {
      let serverError = new common.ServerError({
        message:
          common.ErEnum.MCLI_REPORT_INDEX_DOES_NOT_WORK_WITHOUT_DASHBOARD_ID,
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

    let vizPartQ: VizPartQ;

    if (common.isDefined(this.vizId)) {
      let getVizReqPayload: apiToBackend.ToBackendGetVizRequestPayload = {
        projectId: this.projectId,
        isRepoProd: isRepoProd,
        branchId: this.branch,
        envId: this.env,
        vizId: this.vizId
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

      let url = getVisualizationUrl({
        host: this.context.config.mproveCliHost,
        orgId: getProjectResp.payload.project.orgId,
        projectId: this.projectId,
        repoId: getRepoResp.payload.repo.repoId,
        branch: this.branch,
        env: this.env,
        vizId: vizX.vizId
      });

      vizPartQ = {
        title: reportX.mconfig.chart.title,
        vizId: vizX.vizId,
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

      let url = getDashboardUrl({
        host: this.context.config.mproveCliHost,
        orgId: getProjectResp.payload.project.orgId,
        projectId: this.projectId,
        repoId: getRepoResp.payload.repo.repoId,
        branch: this.branch,
        env: this.env,
        dashboardId: dashboardX.dashboardId
      });

      dashboardPartQ = {
        title: dashboardX.title,
        dashboardId: dashboardX.dashboardId,
        url: url,
        reports: reportPartQs
      };
    }

    let log: any = {};

    if (common.isDefined(this.dashboardId)) {
      log.dashboard = dashboardPartQ;
    }

    if (common.isDefined(this.vizId)) {
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
