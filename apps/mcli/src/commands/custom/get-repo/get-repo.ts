import { Command, Option } from 'clipanion';
import * as t from 'typanion';
import { apiToBackend } from '~mcli/barrels/api-to-backend';
import { common } from '~mcli/barrels/common';
import { enums } from '~mcli/barrels/enums';
import { getConfig } from '~mcli/config/get.config';
import { getDashboardUrl } from '~mcli/functions/get-dashboard-url';
import { getLoginToken } from '~mcli/functions/get-login-token';
import { getModelnUrl as getModelUrl } from '~mcli/functions/get-model-url';
import { getVisualizationUrl } from '~mcli/functions/get-visualization-url';
import { logToConsoleMcli } from '~mcli/functions/log-to-console-mcli';
import { mreq } from '~mcli/functions/mreq';
import { CustomCommand } from '~mcli/models/custom-command';

export class GetRepoCommand extends CustomCommand {
  static paths = [['get-repo']];

  static usage = Command.Usage({
    description: 'Get repo status for selected branch',
    examples: [
      [
        'Get Dev repo with nodes',
        'mprove get-repo -p DXYE72ODCP5LWPWH2EXQ --repo dev --branch main --env prod --get-nodes'
      ],
      [
        'Get Production repo models, dashboards and visualizations',
        'mprove get-repo -p DXYE72ODCP5LWPWH2EXQ --repo production --branch main --env prod --get-models --get-dashboards --get-vizs'
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

  async execute() {
    if (common.isUndefined(this.context.config)) {
      this.context.config = getConfig();
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
      repo.nodes = undefined;
    }

    let log: any = {
      needValidate: getRepoResp.payload.needValidate,
      repo: repo,
      struct: {
        structId: getRepoResp.payload.struct.structId,
        errorsTotal: getRepoResp.payload.struct.errors.length
      },
      modelsTotal: getModelsResp.payload.models.length,
      dashboardsTotal: getDashboardsResp.payload.dashboards.length,
      visualizationsTotal: getVizsResp.payload.vizs.length
    };

    if (getRepoResp.payload.struct.errors.length > 0) {
      log.struct.errors = getRepoResp.payload.struct.errors;
    }

    if (this.getVizs === true) {
      log.visualizations = getVizsResp.payload.vizs.map(x => {
        let url = getVisualizationUrl({
          host: this.context.config.mproveCliHost,
          orgId: getProjectResp.payload.project.orgId,
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
          orgId: getProjectResp.payload.project.orgId,
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
          orgId: getProjectResp.payload.project.orgId,
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
