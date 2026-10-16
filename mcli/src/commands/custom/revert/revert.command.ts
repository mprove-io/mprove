import { Result } from '@praha/byethrow';
import { Command, Option } from 'clipanion';
import * as t from 'typanion';
import { PROD_REPO_ID } from '#common/constants/top';
import { getBuilderUrl } from '#common/functions/get-builder-url/get-builder-url';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import { mapBmlErrorsToMproveValidationErrors } from '#common/functions/map-bml-errors-to-mprove-validation-errors/map-bml-errors-to-mprove-validation-errors';
import type { ToBackendRevertRepoToLastCommitOutput } from '#common/types/backend/routes/repos/revert-repo-to-last-commit/revert-repo-to-last-commit-output';
import type { ToBackendRevertRepoToLastCommitResponse } from '#common/types/backend/routes/repos/revert-repo-to-last-commit/revert-repo-to-last-commit-response';
import type { ToBackendRevertRepoToRemoteOutput } from '#common/types/backend/routes/repos/revert-repo-to-remote/revert-repo-to-remote-output';
import type { ToBackendRevertRepoToRemoteResponse } from '#common/types/backend/routes/repos/revert-repo-to-remote/revert-repo-to-remote-response';
import {
  type RepoType,
  repoTypeValues
} from '#common/types/disk/parts/repo/repo-type';
import { CustomCommand } from '#mcli/classes/custom-command/custom-command';
import { type To, toValues } from '#mcli/commands/custom/revert/to';
import { getApiKeyRepoIdResult } from '#mcli/functions/get-api-key-repo-id-result/get-api-key-repo-id-result';
import { mreqResult } from '#mcli/functions/mreq-result/mreq-result';
import { logToConsoleMcli } from '#mcli/functions/top/log-to-console-mcli/log-to-console-mcli';
import type { GetApiKeyRepoIdError } from '#mcli/types/function-errors/get-api-key-repo-id-error';
import type { MreqError } from '#mcli/types/function-errors/mreq-error';
import type { RevertCommandError } from '#mcli/types/function-errors/revert-command-error';

export class RevertCommand extends CustomCommand {
  static paths = [['revert']];

  static usage = Command.Usage({
    description:
      'Revert (reset) repo to the state of a last commit or Remote repo, validate Mprove Files for selected env',
    examples: [
      [
        'Revert Dev repo to the state of a last commit, validate Mprove Files for env prod',
        'mprove revert --to last-commit --project-id DXYE72ODCP5LWPWH2EXQ --repo-type dev --branch main --env prod'
      ],
      [
        'Revert Production repo to the state of Remote repo, validate Mprove Files for env prod',
        'mprove revert --to remote --project-id DXYE72ODCP5LWPWH2EXQ --repo-type production --branch main --env prod'
      ]
    ]
  });

  to = Option.String('--to', {
    required: true,
    validator: t.isEnum(toValues),
    description: `(required, "${'last-commit' satisfies To}" or "${'remote' satisfies To}")`
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

  override async act(): Result.ResultAsync<void, RevertCommandError> {
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

    let revertRepoOutputResult: Result.Result<
      ToBackendRevertRepoToLastCommitOutput | ToBackendRevertRepoToRemoteOutput,
      MreqError<
        | ToBackendRevertRepoToLastCommitResponse
        | ToBackendRevertRepoToRemoteResponse
      >
    > = await mreqResult({
      apiKey: apiKey,
      route:
        this.to === 'last-commit'
          ? 'api/ToBackendRevertRepoToLastCommit'
          : 'api/ToBackendRevertRepoToRemote',
      payload: {
        projectId: this.projectId,
        repoId: repoId,
        branchId: this.branch,
        envId: this.env
      },
      host: this.context.config.mproveCliHost
    });

    if (Result.isFailure(revertRepoOutputResult)) {
      return revertRepoOutputResult;
    }

    let revertRepoOutput:
      | ToBackendRevertRepoToLastCommitOutput
      | ToBackendRevertRepoToRemoteOutput = revertRepoOutputResult.value;

    let builderUrl = getBuilderUrl({
      host: this.context.config.mproveCliHost,
      orgId: revertRepoOutput.repo.orgId,
      projectId: this.projectId,
      repoId: revertRepoOutput.repo.repoId,
      branch: this.branch,
      env: this.env
    });

    let log: any = {
      message: `Reverted repo state to ${this.to}`,
      validationErrorsTotal: revertRepoOutput.struct.errors.length
    };

    if (this.getRepo === true) {
      let repo = revertRepoOutput.repo;

      delete repo.nodes;
      delete repo.changesToCommit;
      delete repo.changesToPush;

      log.repo = repo;
    }

    if (this.getErrors === true) {
      log.validationErrors = mapBmlErrorsToMproveValidationErrors({
        errors: revertRepoOutput.struct.errors
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
