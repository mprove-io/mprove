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
  ToBackendGetModelRequestPayload,
  ToBackendGetModelResponse
} from '#common/interfaces/to-backend/models/to-backend-get-model';
import { ServerError } from '#common/models/server-error';
import { getConfig } from '#mcli/config/get.config';
import { logToConsoleMcli } from '#mcli/functions/log-to-console-mcli';
import { mreq } from '#mcli/functions/mreq';
import { CustomCommand } from '#mcli/models/custom-command';
import { processGetModelPayload } from '#node-common/functions/process-get-model-payload';

export class GetModelCommand extends CustomCommand {
  static paths = [['get-model']];

  static usage = Command.Usage({
    description: 'Get a model definition including its fields',
    examples: [
      [
        'Get model for Dev repo',
        'mprove get-model --project-id DXYE72ODCP5LWPWH2EXQ --repo dev --branch main --env prod --model-id my_model'
      ],
      [
        'Get model for Production repo',
        'mprove get-model --project-id DXYE72ODCP5LWPWH2EXQ --repo production --branch main --env prod --model-id my_model'
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

  modelId = Option.String('--model-id', {
    required: true,
    description: '(required) Model Id'
  });

  getMalloy = Option.Boolean('--get-malloy', false, {
    description: '(default false), show malloyModelDef in output'
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

    let getModelReqPayload: ToBackendGetModelRequestPayload = {
      projectId: this.projectId,
      repoId: repoId,
      branchId: this.branch,
      envId: this.env,
      modelId: this.modelId,
      getMalloy: this.getMalloy
    };

    let getModelResp = await mreq<ToBackendGetModelResponse>({
      apiKey: apiKey,
      pathInfoName: ToBackendRequestInfoNameEnum.ToBackendGetModel,
      payload: getModelReqPayload,
      host: this.context.config.mproveCliHost
    });

    let log = processGetModelPayload({
      payload: getModelResp.payload
    });

    logToConsoleMcli({
      log: log,
      logLevel: LogLevelEnum.Info,
      context: this.context,
      isJson: this.json
    });
  }
}
