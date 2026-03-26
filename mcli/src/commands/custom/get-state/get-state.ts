import { Command, Option } from 'clipanion';
import * as t from 'typanion';
import { PROD_REPO_ID } from '#common/constants/top';
import { ApiKeyTypeEnum } from '#common/enums/api-key-type.enum';
import { ErEnum } from '#common/enums/er.enum';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { RepoTypeEnum } from '#common/enums/repo-type.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { isUndefined } from '#common/functions/is-undefined';
import {
  ToBackendGetStateRequestPayload,
  ToBackendGetStateResponse
} from '#common/interfaces/to-backend/state/to-backend-get-state';
import { ServerError } from '#common/models/server-error';
import { getConfig } from '#mcli/config/get.config';
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
    validator: t.isEnum(RepoTypeEnum),
    description: `(required, "${RepoTypeEnum.Dev}", "${RepoTypeEnum.Production}" or "${RepoTypeEnum.Session}")`
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

    let apiKey = this.context.config.mproveCliApiKey;

    let repoId =
      this.repo === RepoTypeEnum.Production
        ? PROD_REPO_ID
        : apiKey.startsWith(`${ApiKeyTypeEnum.SK}-`)
          ? apiKey.split('-')[2].toLowerCase()
          : apiKey.split('-')[2];

    let getStateReqPayload: ToBackendGetStateRequestPayload = {
      projectId: this.projectId,
      repoId: repoId,
      branchId: this.branch,
      envId: this.env,
      isFetch: true,
      getErrors: this.getErrors,
      getRepo: this.getRepo,
      getRepoNodes: this.getRepoNodes,
      getModels: this.getModels,
      getDashboards: this.getDashboards,
      getCharts: this.getCharts,
      getMetrics: this.getMetrics,
      getReports: this.getReports
    };

    let getStateResp = await mreq<ToBackendGetStateResponse>({
      apiKey: apiKey,
      pathInfoName: ToBackendRequestInfoNameEnum.ToBackendGetState,
      payload: getStateReqPayload,
      host: this.context.config.mproveCliHost
    });

    logToConsoleMcli({
      log: getStateResp.payload,
      logLevel: LogLevelEnum.Info,
      context: this.context,
      isJson: this.json
    });
  }
}
