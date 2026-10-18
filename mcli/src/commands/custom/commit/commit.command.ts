import { Result } from '@praha/byethrow';
import { Command, Option } from 'clipanion';
import * as t from 'typanion';
import { PROD_REPO_ID, PROJECT_ENV_PROD } from '#common/constants/top';
import { getBuilderUrl } from '#common/functions/get-builder-url/get-builder-url';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { ToBackendCommitRepoOutput } from '#common/types/backend/routes/repos/commit-repo/commit-repo-output';
import type { ToBackendCommitRepoRequest } from '#common/types/backend/routes/repos/commit-repo/commit-repo-request';
import type { ToBackendCommitRepoResponse } from '#common/types/backend/routes/repos/commit-repo/commit-repo-response';
import {
  type RepoType,
  repoTypeValues
} from '#common/types/disk/parts/repo/repo-type';
import { CustomCommand } from '#mcli/classes/custom-command/custom-command';
import { getApiKeyRepoId } from '#mcli/functions/get-api-key-repo-id/get-api-key-repo-id';
import { mreq } from '#mcli/functions/mreq/mreq';
import { logToConsoleMcli } from '#mcli/functions/top/log-to-console-mcli/log-to-console-mcli';
import type { CommitCommandError } from '#mcli/types/function-errors/commit-command-error';
import type { GetApiKeyRepoIdError } from '#mcli/types/function-errors/get-api-key-repo-id-error';
import type { MreqError } from '#mcli/types/function-errors/mreq-error';

export class CommitCommand extends CustomCommand {
  static paths = [['commit']];

  static usage = Command.Usage({
    description: 'Commit changes',
    examples: [
      [
        'Commit changes for Dev repo',
        'mprove commit --project-id DXYE72ODCP5LWPWH2EXQ --repo-type dev --branch main --commit-message ms1'
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

  commitMessage = Option.String('--commit-message', {
    required: true,
    description: '(required) Commit message'
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

  override async act(): Result.ResultAsync<void, CommitCommandError> {
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

    let commitRepoReqPayload: ToBackendCommitRepoRequest['input'] = {
      projectId: this.projectId,
      repoId: repoId,
      branchId: this.branch,
      commitMessage: this.commitMessage
    };

    let commitRepoOutputResult: Result.Result<
      ToBackendCommitRepoOutput,
      MreqError<ToBackendCommitRepoResponse>
    > = await mreq({
      apiKey: apiKey,
      route: 'api/ToBackendCommitRepo',
      payload: commitRepoReqPayload,
      host: this.context.config.mproveCliHost
    });

    if (Result.isFailure(commitRepoOutputResult)) {
      return commitRepoOutputResult;
    }

    let commitRepoOutput: ToBackendCommitRepoOutput =
      commitRepoOutputResult.value;

    let builderUrl = getBuilderUrl({
      host: this.context.config.mproveCliHost,
      orgId: commitRepoOutput.repo.orgId,
      projectId: this.projectId,
      repoId: commitRepoOutput.repo.repoId,
      branch: this.branch,
      env: PROJECT_ENV_PROD
    });

    let log: any = {
      message: `Created commit "${this.commitMessage}"`
    };

    if (this.getRepo === true) {
      let repo = commitRepoOutput.repo;

      delete repo.nodes;
      delete repo.changesToCommit;
      delete repo.changesToPush;

      log.repo = repo;
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
