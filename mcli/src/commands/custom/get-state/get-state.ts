import { Command, Option } from 'clipanion';
import * as t from 'typanion';
import { ErEnum } from '#common/enums/er.enum';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { RepoEnum } from '#common/enums/repo.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { isUndefined } from '#common/functions/is-undefined';
import {
  ToBackendGetChartsRequestPayload,
  ToBackendGetChartsResponse
} from '#common/interfaces/to-backend/charts/to-backend-get-charts';
import {
  ToBackendGetDashboardsRequestPayload,
  ToBackendGetDashboardsResponse
} from '#common/interfaces/to-backend/dashboards/to-backend-get-dashboards';
import {
  ToBackendGetModelsRequestPayload,
  ToBackendGetModelsResponse
} from '#common/interfaces/to-backend/models/to-backend-get-models';
import {
  ToBackendGetReportsRequestPayload,
  ToBackendGetReportsResponse
} from '#common/interfaces/to-backend/reports/to-backend-get-reports';
import {
  ToBackendGetRepoRequestPayload,
  ToBackendGetRepoResponse
} from '#common/interfaces/to-backend/repos/to-backend-get-repo';
import { ServerError } from '#common/models/server-error';
import { getConfig } from '#mcli/config/get.config';
import { getBuilderUrl } from '#mcli/functions/get-builder-url';
import { getChartUrl } from '#mcli/functions/get-chart-url';
import { getDashboardUrl } from '#mcli/functions/get-dashboard-url';
import { getLoginToken } from '#mcli/functions/get-login-token';
import { getModelUrl } from '#mcli/functions/get-model-url';
import { getReportUrl } from '#mcli/functions/get-report-url';
import { logToConsoleMcli } from '#mcli/functions/log-to-console-mcli';
import { mreq } from '#mcli/functions/mreq';
import { CustomCommand } from '#mcli/models/custom-command';

export class GetStateCommand extends CustomCommand {
  static paths = [['get-state']];

  static usage = Command.Usage({
    description:
      'Get state (models, dashboards, charts, reports, metrics, errors, repo nodes)',
    examples: [
      [
        'Get Dev repo state',
        'mprove get-state --project-id DXYE72ODCP5LWPWH2EXQ --repo dev --branch main --env prod --get-repo --get-repo-nodes'
      ],
      [
        'Get Production repo state',
        'mprove get-state --project-id DXYE72ODCP5LWPWH2EXQ --repo production --branch main --env prod --get-models --get-dashboards --get-charts --get-metrics --get-reports'
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

  getErrors = Option.Boolean('--get-errors', false, {
    description: '(default false), show validation errors in output'
  });

  getRepo = Option.Boolean('--get-repo', false, {
    description: '(default false), show repo in output'
  });

  getRepoNodes = Option.Boolean('--get-repo-nodes', false, {
    description: '(default false), show repo nodes in output'
  });

  getModels = Option.Boolean('--get-models', false, {
    description: '(default false), show modelIds in output'
  });

  getDashboards = Option.Boolean('--get-dashboards', false, {
    description: '(default false), show dashboardIds in output'
  });

  getCharts = Option.Boolean('--get-charts', false, {
    description: '(default false), show chartIds in output'
  });

  getMetrics = Option.Boolean('--get-metrics', false, {
    description: '(default false), show metricIds in output'
  });

  getReports = Option.Boolean('--get-reports', false, {
    description: '(default false), show reportIds in output'
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

    let isRepoProd = this.repo === 'production' ? true : false;

    let loginToken = await getLoginToken(this.context);

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

    let getModelsReqPayload: ToBackendGetModelsRequestPayload = {
      projectId: this.projectId,
      isRepoProd: isRepoProd,
      branchId: this.branch,
      envId: this.env
    };

    let getModelsResp = await mreq<ToBackendGetModelsResponse>({
      loginToken: loginToken,
      pathInfoName: ToBackendRequestInfoNameEnum.ToBackendGetModels,
      payload: getModelsReqPayload,
      host: this.context.config.mproveCliHost
    });

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

    let getReportsReqPayload: ToBackendGetReportsRequestPayload = {
      projectId: this.projectId,
      isRepoProd: isRepoProd,
      branchId: this.branch,
      envId: this.env
    };

    let getReportsResp = await mreq<ToBackendGetReportsResponse>({
      loginToken: loginToken,
      pathInfoName: ToBackendRequestInfoNameEnum.ToBackendGetReports,
      payload: getReportsReqPayload,
      host: this.context.config.mproveCliHost
    });

    let builderUrl = getBuilderUrl({
      host: this.context.config.mproveCliHost,
      orgId: getRepoResp.payload.repo.orgId,
      projectId: this.projectId,
      repoId: getRepoResp.payload.repo.repoId,
      branch: this.branch,
      env: this.env
    });

    let log: any = {
      validationErrorsTotal: getRepoResp.payload.struct.errors.length,
      modelsTotal: getModelsResp.payload.models.length,
      dashboardsTotal: getDashboardsResp.payload.dashboardParts.length,
      chartsTotal: getChartsResp.payload.charts.length,
      needValidate: getRepoResp.payload.needValidate,
      structId: getRepoResp.payload.struct.structId
    };

    if (this.getCharts === true) {
      log.charts = getChartsResp.payload.charts.map(x => {
        let url = getChartUrl({
          host: this.context.config.mproveCliHost,
          orgId: getRepoResp.payload.repo.orgId,
          projectId: this.projectId,
          repoId: getRepoResp.payload.repo.repoId,
          branch: this.branch,
          env: this.env,
          chartId: x.chartId,
          timezone: getRepoResp.payload.struct.mproveConfig.defaultTimezone
        });

        let chart: any = {
          chartId: x.chartId,
          url: url
        };

        return chart;
      });
    }

    if (this.getMetrics === true) {
      log.metrics = getReportsResp.payload.struct.metrics.map(x => {
        let metric: any = {
          metricId: x.metricId,
          name: `${x.partNodeLabel} ${x.partFieldLabel} by ${x.timeNodeLabel} ${x.timeFieldLabel} - ${x.topLabel}`
        };

        return metric;
      });
    }

    if (this.getReports === true) {
      log.reports = getReportsResp.payload.reports.map(x => {
        let url = getReportUrl({
          host: this.context.config.mproveCliHost,
          orgId: getRepoResp.payload.repo.orgId,
          projectId: this.projectId,
          repoId: getRepoResp.payload.repo.repoId,
          branch: this.branch,
          env: this.env,
          reportId: x.reportId,
          timezone: getRepoResp.payload.struct.mproveConfig.defaultTimezone,
          timeSpec: 'days',
          timeRange: 'f`last 5 days`'
        });

        let report: any = {
          reportId: x.reportId,
          url: url
        };

        return report;
      });
    }

    if (this.getDashboards === true) {
      log.dashboards = getDashboardsResp.payload.dashboardParts.map(x => {
        let url = getDashboardUrl({
          host: this.context.config.mproveCliHost,
          orgId: getRepoResp.payload.repo.orgId,
          projectId: this.projectId,
          repoId: getRepoResp.payload.repo.repoId,
          branch: this.branch,
          env: this.env,
          dashboardId: x.dashboardId,
          timezone: getRepoResp.payload.struct.mproveConfig.defaultTimezone
        });

        let dashboard: any = {
          dashboardId: x.dashboardId,
          url: url
        };

        return dashboard;
      });
    }

    if (this.getModels === true) {
      log.models = getModelsResp.payload.models.map(x => {
        let url = getModelUrl({
          host: this.context.config.mproveCliHost,
          orgId: getRepoResp.payload.repo.orgId,
          projectId: this.projectId,
          repoId: getRepoResp.payload.repo.repoId,
          branch: this.branch,
          env: this.env,
          modelId: x.modelId
        });

        let model: any = {
          modelId: x.modelId,
          url: url
        };

        return model;
      });
    }

    if (this.getRepo === true) {
      let repo = getRepoResp.payload.repo;

      if (this.getRepoNodes === false) {
        delete repo.nodes;
      }

      delete repo.changesToCommit;
      delete repo.changesToPush;

      log.repo = repo;
    }

    if (this.getErrors === true) {
      log.validationErrors = getRepoResp.payload.struct.errors;
    }

    log.builderUrl = builderUrl;

    logToConsoleMcli({
      log: log,
      logLevel: LogLevelEnum.Info,
      context: this.context,
      isJson: this.json
    });
  }
}
