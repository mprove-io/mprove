import { Result } from '@praha/byethrow';
import { Command, Option } from 'clipanion';
import * as t from 'typanion';
import { PROD_REPO_ID } from '#common/constants/top';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { ToBackendValidateFilesOutput } from '#common/types/backend/routes/files/validate-files/validate-files-output';
import type { ToBackendValidateFilesRequest } from '#common/types/backend/routes/files/validate-files/validate-files-request';
import type { ToBackendValidateFilesResponse } from '#common/types/backend/routes/files/validate-files/validate-files-response';
import {
  type RepoType,
  repoTypeValues
} from '#common/types/disk/parts/repo/repo-type';
import { CustomCommand } from '#mcli/classes/custom-command/custom-command';
import { getApiKeyRepoId } from '#mcli/functions/get-api-key-repo-id/get-api-key-repo-id';
import { mreq } from '#mcli/functions/mreq/mreq';
import { logToConsoleMcli } from '#mcli/functions/top/log-to-console-mcli/log-to-console-mcli';
import type { GetApiKeyRepoIdError } from '#mcli/types/function-errors/get-api-key-repo-id-error';
import type { MreqError } from '#mcli/types/function-errors/mreq-error';
import type { ValidateCommandError } from '#mcli/types/function-errors/validate-command-error';
import { processValidateFilesPayload } from '#node-common/functions/process-validate-files-payload/process-validate-files-payload';

export class ValidateCommand extends CustomCommand {
  static paths = [['validate']];

  static usage = Command.Usage({
    description: 'Validate (rebuild) Mprove Files for selected env',
    examples: [
      [
        'Validate Mprove Files for Dev repo, env prod',
        'mprove validate --project-id DXYE72ODCP5LWPWH2EXQ --repo-type dev --branch main --env prod'
      ],
      [
        'Validate Mprove Files for Production repo, env prod',
        'mprove validate --project-id DXYE72ODCP5LWPWH2EXQ --repo-type production --branch main --env prod'
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

  json = Option.Boolean('--json', false, {
    description: '(default false)'
  });

  envFilePath = Option.String('--env-file-path', {
    description: '(optional) Path to ".env" file'
  });

  override async act(): Result.ResultAsync<void, ValidateCommandError> {
    this.projectId = this.projectId || this.context.config.mproveCliProjectId;

    if (isUndefined(this.projectId)) {
      return Result.fail({ code: 'MCLI_PROJECT_ID_IS_NOT_DEFINED' });
    }

    let apiKey = this.context.config.mproveCliApiKey;

    let repoIdResult: Result.Result<string, GetApiKeyRepoIdError> =
      this.repoType === 'production'
        ? Result.succeed(PROD_REPO_ID)
        : getApiKeyRepoId({ apiKey: apiKey });

    if (Result.isFailure(repoIdResult)) {
      return repoIdResult;
    }

    let repoId: string = repoIdResult.value;

    let validateFilesReqPayload: ToBackendValidateFilesRequest['input'] = {
      projectId: this.projectId,
      repoId: repoId,
      branchId: this.branch,
      envId: this.env
    };

    let validateFilesOutputResult: Result.Result<
      ToBackendValidateFilesOutput,
      MreqError<ToBackendValidateFilesResponse>
    > = await mreq({
      apiKey: apiKey,
      route: 'api/ToBackendValidateFiles',
      payload: validateFilesReqPayload,
      host: this.context.config.mproveCliHost
    });

    if (Result.isFailure(validateFilesOutputResult)) {
      return validateFilesOutputResult;
    }

    let validateFilesOutput: ToBackendValidateFilesOutput =
      validateFilesOutputResult.value;

    let log = processValidateFilesPayload({
      payload: validateFilesOutput,
      host: this.context.config.mproveCliHost,
      projectId: this.projectId,
      branch: this.branch,
      env: this.env
    });

    logToConsoleMcli({
      log: log,
      logLevel: 'Info',
      context: this.context,
      isJson: this.json
    });

    return Result.succeed();
  }
}
