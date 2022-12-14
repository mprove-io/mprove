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

export class GetRepoCommand extends CustomCommand {
  static paths = [['get-repo']];

  static usage = Command.Usage({
    description: 'Get repo status for selected branch',
    examples: [
      [
        'Get Production repo status',
        'mprove get-repo --projectId DXYE72ODCP5LWPWH2EXQ --repo production --branch main --env prod --verbose'
      ]
    ]
  });

  project = Option.String('--projectId', {
    required: true,
    description: '(required) Project Id'
  });

  repo = Option.String('--repo', {
    required: true,
    validator: t.isEnum(enums.RepoEnum),
    description: `(required, "${enums.RepoEnum.Dev}" or "${enums.RepoEnum.Production}")`
  });

  branchId = Option.String('--branch', {
    required: true,
    description: '(required) Git Branch'
  });

  env = Option.String('--env', {
    required: true,
    description: '(required) Environment'
  });

  verbose = Option.Boolean('--verbose', false, {
    description:
      '(default false), set flag to show modelIds, dashboardIds, visualizationIds'
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

    let getRepoReqPayload: apiToBackend.ToBackendGetRepoRequestPayload = {
      projectId: this.project,
      isRepoProd: isRepoProd,
      branchId: this.branchId,
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
      projectId: this.project,
      isRepoProd: isRepoProd,
      branchId: this.branchId,
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
      projectId: this.project,
      isRepoProd: isRepoProd,
      branchId: this.branchId,
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
        projectId: this.project,
        isRepoProd: isRepoProd,
        branchId: this.branchId,
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

    repo.nodes = undefined;

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

    if (this.verbose === true) {
      log.modelIds = getModelsResp.payload.models.map(x => x.modelId);
      log.dashboardIds = getDashboardsResp.payload.dashboards.map(
        x => x.dashboardId
      );
      log.visualizationIds = getVizsResp.payload.vizs.map(x => x.vizId);
    }

    logToConsoleMcli({
      log: log,
      logLevel: common.LogLevelEnum.Info,
      context: this.context,
      isJson: this.json
    });
  }
}
