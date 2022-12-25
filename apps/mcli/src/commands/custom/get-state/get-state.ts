import { Command, Option } from 'clipanion';
import * as t from 'typanion';
import { apiToBackend } from '~mcli/barrels/api-to-backend';
import { common } from '~mcli/barrels/common';
import { enums } from '~mcli/barrels/enums';
import { getConfig } from '~mcli/config/get.config';
import { getDashboardUrl } from '~mcli/functions/get-dashboard-url';
import { getFilesUrl } from '~mcli/functions/get-files-url';
import { getLoginToken } from '~mcli/functions/get-login-token';
import { getModelUrl } from '~mcli/functions/get-model-url';
import { getVisualizationUrl } from '~mcli/functions/get-visualization-url';
import { logToConsoleMcli } from '~mcli/functions/log-to-console-mcli';
import { mreq } from '~mcli/functions/mreq';
import { CustomCommand } from '~mcli/models/custom-command';

export class GetStateCommand extends CustomCommand {
  static paths = [['get-state']];

  static usage = Command.Usage({
    description:
      'Get state (models, dashboards, visualizations, errors, repo nodes)',
    examples: [
      [
        'Get Dev repo state',
        'mprove get-state --project-id DXYE72ODCP5LWPWH2EXQ --repo dev --branch main --env prod --get-nodes'
      ],
      [
        'Get Production repo state',
        'mprove get-state --project-id DXYE72ODCP5LWPWH2EXQ --repo production --branch main --env prod --get-models --get-dashboards --get-vizs'
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

  getNodes = Option.Boolean('--get-nodes', false, {
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

    let repo = getRepoResp.payload.repo;

    if (this.getNodes === false) {
      delete repo.nodes;
    }

    delete repo.changesToCommit;
    delete repo.changesToPush;

    let filesUrl = getFilesUrl({
      host: this.context.config.mproveCliHost,
      orgId: getRepoResp.payload.repo.orgId,
      projectId: this.projectId,
      repoId: getRepoResp.payload.repo.repoId,
      branch: this.branch,
      env: this.env
    });

    let log: any = {
      url: filesUrl,
      errorsTotal: getRepoResp.payload.struct.errors.length,
      modelsTotal: getModelsResp.payload.models.length,
      dashboardsTotal: getDashboardsResp.payload.dashboards.length,
      visualizationsTotal: getVizsResp.payload.vizs.length,
      repo: repo,
      needValidate: getRepoResp.payload.needValidate,
      structId: getRepoResp.payload.struct.structId
    };

    if (getRepoResp.payload.struct.errors.length > 0) {
      log.errors = getRepoResp.payload.struct.errors;
    }

    if (this.getVizs === true) {
      log.visualizations = getVizsResp.payload.vizs.map(x => {
        let url = getVisualizationUrl({
          host: this.context.config.mproveCliHost,
          orgId: getRepoResp.payload.repo.orgId,
          projectId: this.projectId,
          repoId: getRepoResp.payload.repo.repoId,
          branch: this.branch,
          env: this.env,
          vizId: x.vizId
        });

        let visualization: any = {
          vizId: x.vizId,
          url: url
        };

        return visualization;
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

    logToConsoleMcli({
      log: log,
      logLevel: common.LogLevelEnum.Info,
      context: this.context,
      isJson: this.json
    });
  }
}
