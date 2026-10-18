import { Result } from '@praha/byethrow';
import { Command, Option } from 'clipanion';
import * as t from 'typanion';
import { PROD_REPO_ID } from '#common/constants/top';
import { getBuilderUrl } from '#common/functions/get-builder-url/get-builder-url';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import { mapBmlErrorsToMproveValidationErrors } from '#common/functions/map-bml-errors-to-mprove-validation-errors/map-bml-errors-to-mprove-validation-errors';
import type { ToBackendPushRepoOutput } from '#common/types/backend/routes/repos/push-repo/push-repo-output';
import type { ToBackendPushRepoRequest } from '#common/types/backend/routes/repos/push-repo/push-repo-request';
import type { ToBackendPushRepoResponse } from '#common/types/backend/routes/repos/push-repo/push-repo-response';
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
import type { PushCommandError } from '#mcli/types/function-errors/push-command-error';

export class PushCommand extends CustomCommand {
  static paths = [['push']];

  static usage = Command.Usage({
    description:
      'Push committed changes from repo to Remote, validate Mprove Files for selected env',
    examples: [
      [
        'Push committed changes from Dev to Remote, validate Mprove Files for env prod',
        'mprove push --project-id DXYE72ODCP5LWPWH2EXQ --repo-type dev --branch main --env prod'
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

  getErrors = Option.Boolean('--get-errors', false, {
    description: '(default false), show validation errors in output'
  });

  getRepo = Option.Boolean('--get-repo', false, {
    description: '(default false), show repo in output'
  });

  json = Option.Boolean('--json', false, {
    description: '(default false)'
  });

  envFilePath = Option.String('--env-file-path', {
    description: '(optional) Path to ".env" file'
  });

  override async act(): Result.ResultAsync<void, PushCommandError> {
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

    let pushRepoReqPayload: ToBackendPushRepoRequest['input'] = {
      projectId: this.projectId,
      repoId: repoId,
      branchId: this.branch,
      envId: this.env
    };

    let pushRepoOutputResult: Result.Result<
      ToBackendPushRepoOutput,
      MreqError<ToBackendPushRepoResponse>
    > = await mreq({
      apiKey: apiKey,
      route: 'api/ToBackendPushRepo',
      payload: pushRepoReqPayload,
      host: this.context.config.mproveCliHost
    });

    if (Result.isFailure(pushRepoOutputResult)) {
      return pushRepoOutputResult;
    }

    let pushRepoOutput: ToBackendPushRepoOutput = pushRepoOutputResult.value;

    let builderUrl = getBuilderUrl({
      host: this.context.config.mproveCliHost,
      orgId: pushRepoOutput.repo.orgId,
      projectId: this.projectId,
      repoId: pushRepoOutput.repo.repoId,
      branch: this.branch,
      env: this.env
    });

    let log: any = {
      message: `Pushed changes to Remote`,
      validationErrorsTotal: pushRepoOutput.struct.errors.length
    };

    if (this.getRepo === true) {
      let repo = pushRepoOutput.repo;

      delete repo.nodes;
      delete repo.changesToCommit;
      delete repo.changesToPush;

      log.repo = repo;
    }

    if (this.getErrors === true) {
      log.validationErrors = mapBmlErrorsToMproveValidationErrors({
        errors: pushRepoOutput.struct.errors
      });
    }

    log.url = builderUrl;

    logToConsoleMcli({
      log: log,
      logLevel: 'Info',
      context: this.context,
      isJson: this.json
    });

    return Result.succeed();
  }
}
