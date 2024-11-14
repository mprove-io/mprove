import { Command, Option } from 'clipanion';
import * as t from 'typanion';
import { apiToBackend } from '~mcli/barrels/api-to-backend';
import { common } from '~mcli/barrels/common';
import { enums } from '~mcli/barrels/enums';
import { getConfig } from '~mcli/config/get.config';
import { getChartUrl } from '~mcli/functions/get-chart-url';
import { getDashboardUrl } from '~mcli/functions/get-dashboard-url';
import { getFilesUrl } from '~mcli/functions/get-files-url';
import { getLoginToken } from '~mcli/functions/get-login-token';
import { getModelUrl } from '~mcli/functions/get-model-url';
import { getReportUrl } from '~mcli/functions/get-report-url';
import { logToConsoleMcli } from '~mcli/functions/log-to-console-mcli';
import { mreq } from '~mcli/functions/mreq';
import { CustomCommand } from '~mcli/models/custom-command';

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
        'mprove get-state --project-id DXYE72ODCP5LWPWH2EXQ --repo production --branch main --env prod --get-models --get-dashboards --get-vizs --get-metrics --get-reports'
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

  getVizs = Option.Boolean('--get-vizs', false, {
    description: '(default false), show vizIds in output'
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

    let isRepoProd = this.repo === 'production' ? true : false;

    let loginToken = await getLoginToken(this.context);

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

    let getModelsReqPayload: apiToBackend.ToBackendGetModelsRequestPayload = {
      projectId: this.projectId,
      isRepoProd: isRepoProd,
      branchId: this.branch,
      envId: this.env
    };

    let getModelsResp = await mreq<apiToBackend.ToBackendGetModelsResponse>({
      loginToken: loginToken,
      pathInfoName:
        apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetModels,
      payload: getModelsReqPayload,
      host: this.context.config.mproveCliHost
    });

    let getVizsReqPayload: apiToBackend.ToBackendGetVizsRequestPayload = {
      projectId: this.projectId,
      isRepoProd: isRepoProd,
      branchId: this.branch,
      envId: this.env
    };

    let getVizsResp = await mreq<apiToBackend.ToBackendGetVizsResponse>({
      loginToken: loginToken,
      pathInfoName: apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetVizs,
      payload: getVizsReqPayload,
      host: this.context.config.mproveCliHost
    });

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

    let getMetricsReqPayload: apiToBackend.ToBackendGetMetricsRequestPayload = {
      projectId: this.projectId,
      isRepoProd: isRepoProd,
      branchId: this.branch,
      envId: this.env
    };

    let getMetricsResp = await mreq<apiToBackend.ToBackendGetMetricsResponse>({
      loginToken: loginToken,
      pathInfoName:
        apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetMetrics,
      payload: getVizsReqPayload,
      host: this.context.config.mproveCliHost
    });

    let filesUrl = getFilesUrl({
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
      dashboardsTotal: getDashboardsResp.payload.dashboards.length,
      chartsTotal: getVizsResp.payload.vizs.length,
      needValidate: getRepoResp.payload.needValidate,
      structId: getRepoResp.payload.struct.structId
    };

    if (this.getVizs === true) {
      log.charts = getVizsResp.payload.vizs.map(x => {
        let url = getChartUrl({
          host: this.context.config.mproveCliHost,
          orgId: getRepoResp.payload.repo.orgId,
          projectId: this.projectId,
          repoId: getRepoResp.payload.repo.repoId,
          branch: this.branch,
          env: this.env,
          vizId: x.vizId
        });

        let chart: any = {
          vizId: x.vizId,
          url: url
        };

        return chart;
      });
    }

    if (this.getMetrics === true) {
      log.metrics = getMetricsResp.payload.metrics.map(x => {
        let metric: any = {
          metricId: x.metricId,
          name: `${x.partNodeLabel} ${x.partFieldLabel} by ${x.timeNodeLabel} ${x.timeFieldLabel} - ${x.topLabel}`
        };

        return metric;
      });
    }

    if (this.getReports === true) {
      log.reports = getMetricsResp.payload.reps.map(x => {
        let url = getReportUrl({
          host: this.context.config.mproveCliHost,
          orgId: getRepoResp.payload.repo.orgId,
          projectId: this.projectId,
          repoId: getRepoResp.payload.repo.repoId,
          branch: this.branch,
          env: this.env,
          reportId: x.repId,
          timezone: 'UTC',
          timeSpec: 'days',
          timeRange: 'last 5 days complete plus current'
        });

        let report: any = {
          reportId: x.repId,
          url: url
        };

        return report;
      });
    }

    if (this.getDashboards === true) {
      log.dashboards = getDashboardsResp.payload.dashboards.map(x => {
        let url = getDashboardUrl({
          host: this.context.config.mproveCliHost,
          orgId: getRepoResp.payload.repo.orgId,
          projectId: this.projectId,
          repoId: getRepoResp.payload.repo.repoId,
          branch: this.branch,
          env: this.env,
          dashboardId: x.dashboardId
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

    log.filesUrl = filesUrl;

    logToConsoleMcli({
      log: log,
      logLevel: common.LogLevelEnum.Info,
      context: this.context,
      isJson: this.json
    });
  }
}
