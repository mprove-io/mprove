import { Result } from '@praha/byethrow';
import { Command, Option } from 'clipanion';
import * as t from 'typanion';
import { PROD_REPO_ID } from '#common/constants/top';
import { getBuilderUrl } from '#common/functions/get-builder-url/get-builder-url';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import { mapBmlErrorsToMproveValidationErrors } from '#common/functions/map-bml-errors-to-mprove-validation-errors/map-bml-errors-to-mprove-validation-errors';
import type { ToBackendPullRepoOutput } from '#common/types/backend/routes/repos/pull-repo/pull-repo-output';
import type { ToBackendPullRepoRequest } from '#common/types/backend/routes/repos/pull-repo/pull-repo-request';
import type { ToBackendPullRepoResponse } from '#common/types/backend/routes/repos/pull-repo/pull-repo-response';
import {
  type RepoType,
  repoTypeValues
} from '#common/types/disk/parts/repo/repo-type';
import { CustomCommand } from '#mcli/classes/custom-command/custom-command';
import { getApiKeyRepoIdResult } from '#mcli/functions/get-api-key-repo-id-result/get-api-key-repo-id-result';
import { mreqResult } from '#mcli/functions/mreq-result/mreq-result';
import { logToConsoleMcli } from '#mcli/functions/top/log-to-console-mcli/log-to-console-mcli';
import type { GetApiKeyRepoIdError } from '#mcli/types/function-errors/get-api-key-repo-id-error';
import type { MreqError } from '#mcli/types/function-errors/mreq-error';
import type { PullCommandError } from '#mcli/types/function-errors/pull-command-error';

export class PullCommand extends CustomCommand {
  static paths = [['pull']];

  static usage = Command.Usage({
    description:
      'Pull committed changes from Remote to repo, validate Mprove Files for selected env',
    examples: [
      [
        'Pull committed changes from Remote to Dev repo, validate Mprove Files for env prod',
        'mprove pull --project-id DXYE72ODCP5LWPWH2EXQ --repo-type dev --branch main --env prod'
      ],
      [
        'Pull committed changes from Remote to Production repo, validate Mprove Files for env prod',
        'mprove pull --project-id DXYE72ODCP5LWPWH2EXQ --repo-type production --branch main --env prod'
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

  override async act(): Result.ResultAsync<void, PullCommandError> {
    this.projectId = this.projectId || this.context.config.mproveCliProjectId;

    if (isUndefined(this.projectId)) {
      return Result.fail({ code: 'MCLI_PROJECT_ID_IS_NOT_DEFINED' });
    }

    let apiKey = this.context.config.mproveCliApiKey;

    let repoIdResult: Result.Result<string, GetApiKeyRepoIdError> =
      this.repoType === 'production'
        ? Result.succeed(PROD_REPO_ID)
        : getApiKeyRepoIdResult({ apiKey: apiKey });

    if (Result.isFailure(repoIdResult)) {
      return repoIdResult;
    }

    let repoId: string = repoIdResult.value;

    let pullRepoReqPayload: ToBackendPullRepoRequest['input'] = {
      projectId: this.projectId,
      repoId: repoId,
      branchId: this.branch,
      envId: this.env
    };

    let pullRepoOutputResult: Result.Result<
      ToBackendPullRepoOutput,
      MreqError<ToBackendPullRepoResponse>
    > = await mreqResult({
      apiKey: apiKey,
      route: 'api/ToBackendPullRepo',
      payload: pullRepoReqPayload,
      host: this.context.config.mproveCliHost
    });

    if (Result.isFailure(pullRepoOutputResult)) {
      return pullRepoOutputResult;
    }

    let pullRepoOutput: ToBackendPullRepoOutput = pullRepoOutputResult.value;

    let builderUrl = getBuilderUrl({
      host: this.context.config.mproveCliHost,
      orgId: pullRepoOutput.repo.orgId,
      projectId: this.projectId,
      repoId: pullRepoOutput.repo.repoId,
      branch: this.branch,
      env: this.env
    });

    let log: any = {
      message: `Pulled changes from Remote`,
      validationErrorsTotal: pullRepoOutput.struct.errors.length
    };

    if (this.getRepo === true) {
      let repo = pullRepoOutput.repo;

      delete repo.nodes;
      delete repo.changesToCommit;
      delete repo.changesToPush;

      log.repo = repo;
    }

    if (this.getErrors === true) {
      log.validationErrors = mapBmlErrorsToMproveValidationErrors({
        errors: pullRepoOutput.struct.errors
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
