import { Command, Option } from 'clipanion';
import * as t from 'typanion';
import { ServerError } from '#common/classes/server-error/server-error';
import { PROD_REPO_ID } from '#common/constants/top';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { ApiKeyType } from '#common/types/backend/parts/api-key/api-key-type';
import type { ToBackendGetModelOutput } from '#common/types/backend/routes/models/get-model/get-model-output';
import type { ToBackendGetModelRequest } from '#common/types/backend/routes/models/get-model/get-model-request';
import {
  type RepoType,
  repoTypeValues
} from '#common/types/disk/parts/repo/repo-type';
import { CustomCommand } from '#mcli/classes/custom-command/custom-command';
import { getConfig } from '#mcli/config/get.config';
import { mreq } from '#mcli/functions/mreq/mreq';
import { logToConsoleMcli } from '#mcli/functions/top/log-to-console-mcli/log-to-console-mcli';
import { processGetModelPayload } from '#node-common/functions/process-get-model-payload/process-get-model-payload';

export class GetModelCommand extends CustomCommand {
  static paths = [['get-model']];

  static usage = Command.Usage({
    description: 'Get a model definition including its fields',
    examples: [
      [
        'Get model for Dev repo',
        'mprove get-model --project-id DXYE72ODCP5LWPWH2EXQ --repo-type dev --branch main --env prod --model-id my_model'
      ],
      [
        'Get model for Production repo',
        'mprove get-model --project-id DXYE72ODCP5LWPWH2EXQ --repo-type production --branch main --env prod --model-id my_model'
      ]
    ]
  });

  projectId = Option.String('--project-id', {
    description: '(required) Project Id'
  });

  repoType = Option.String('--repo-type', {
    required: true,
    validator: t.isEnum(repoTypeValues),
    description: `(required, "${'dev' satisfies RepoType}", "${'production' satisfies RepoType}" or "${'session' satisfies RepoType}")`
  });

  branch = Option.String('--branch', {
    required: true,
    description: '(required) Git Branch'
  });

  env = Option.String('--env', 'prod', {
    description: '(default "prod") Environment'
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
        message: 'MCLI_PROJECT_ID_IS_NOT_DEFINED',
        originalError: null
      });
      throw serverError;
    }

    let apiKey = this.context.config.mproveCliApiKey;

    let repoId =
      this.repoType === 'production'
        ? PROD_REPO_ID
        : apiKey.startsWith(`${'SK' satisfies ApiKeyType}-`)
          ? apiKey.split('-')[2].toLowerCase()
          : apiKey.split('-')[2];

    let getModelReqPayload: ToBackendGetModelRequest['input'] = {
      projectId: this.projectId,
      repoId: repoId,
      branchId: this.branch,
      envId: this.env,
      modelId: this.modelId,
      getMalloy: this.getMalloy
    };

    let getModelOutput: ToBackendGetModelOutput = await mreq({
      apiKey: apiKey,
      route: 'api/ToBackendGetModel',
      payload: getModelReqPayload,
      host: this.context.config.mproveCliHost
    });

    let log = processGetModelPayload({
      payload: getModelOutput
    });

    logToConsoleMcli({
      log: log,
      logLevel: 'Info',
      context: this.context,
      isJson: this.json
    });
  }
}
