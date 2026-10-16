import { Result } from '@praha/byethrow';
import { Command, Option } from 'clipanion';
import { getBuilderUrl } from '#common/functions/get-builder-url/get-builder-url';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import { mapBmlErrorsToMproveValidationErrors } from '#common/functions/map-bml-errors-to-mprove-validation-errors/map-bml-errors-to-mprove-validation-errors';
import type { ToBackendMergeRepoOutput } from '#common/types/backend/routes/repos/merge-repo/merge-repo-output';
import type { ToBackendMergeRepoRequest } from '#common/types/backend/routes/repos/merge-repo/merge-repo-request';
import type { ToBackendMergeRepoResponse } from '#common/types/backend/routes/repos/merge-repo/merge-repo-response';
import { CustomCommand } from '#mcli/classes/custom-command/custom-command';
import { getApiKeyRepoIdResult } from '#mcli/functions/get-api-key-repo-id-result/get-api-key-repo-id-result';
import { mreqResult } from '#mcli/functions/mreq-result/mreq-result';
import { logToConsoleMcli } from '#mcli/functions/top/log-to-console-mcli/log-to-console-mcli';
import type { GetApiKeyRepoIdError } from '#mcli/types/function-errors/get-api-key-repo-id-error';
import type { MergeCommandError } from '#mcli/types/function-errors/merge-command-error';
import type { MreqError } from '#mcli/types/function-errors/mreq-error';

export class MergeCommand extends CustomCommand {
  static paths = [['merge']];

  static usage = Command.Usage({
    description:
      'Merge their-branch to branch for Dev repo, validate Mprove Files for selected env',
    examples: [
      [
        'Merge their-branch to branch for Dev repo, validate Mprove Files for env prod',
        'mprove merge --project-id DXYE72ODCP5LWPWH2EXQ --their-branch b1 --branch main --env prod'
      ]
    ]
  });

  projectId = Option.String('--project-id', {
    description: '(required) Project Id'
  });

  branch = Option.String('--branch', {
    required: true,
    description: '(required) Git Branch'
  });

  theirBranch = Option.String('--their-branch', {
    required: true,
    description: '(required) Their git Branch'
  });

  env = Option.String('--env', 'prod', {
    description: '(default "prod") Environment'
  });

  theirBranchRemote = Option.Boolean('--their-branch-remote', false, {
    description: '(default false), merge from production (remote) repo branch'
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

  override async act(): Result.ResultAsync<void, MergeCommandError> {
    this.projectId = this.projectId || this.context.config.mproveCliProjectId;

    if (isUndefined(this.projectId)) {
      return Result.fail({ code: 'MCLI_PROJECT_ID_IS_NOT_DEFINED' });
    }

    let apiKey = this.context.config.mproveCliApiKey;

    let repoIdResult: Result.Result<string, GetApiKeyRepoIdError> =
      getApiKeyRepoIdResult({ apiKey: apiKey });

    if (Result.isFailure(repoIdResult)) {
      return repoIdResult;
    }

    let repoId: string = repoIdResult.value;

    let mergeRepoReqPayload: ToBackendMergeRepoRequest['input'] = {
      projectId: this.projectId,
      repoId: repoId,
      branchId: this.branch,
      theirBranchId: this.theirBranch,
      envId: this.env,
      isTheirBranchRemote: this.theirBranchRemote
    };

    let mergeRepoOutputResult: Result.Result<
      ToBackendMergeRepoOutput,
      MreqError<ToBackendMergeRepoResponse>
    > = await mreqResult({
      apiKey: this.context.config.mproveCliApiKey,
      route: 'api/ToBackendMergeRepo',
      payload: mergeRepoReqPayload,
      host: this.context.config.mproveCliHost
    });

    if (Result.isFailure(mergeRepoOutputResult)) {
      return mergeRepoOutputResult;
    }

    let mergeRepoOutput: ToBackendMergeRepoOutput = mergeRepoOutputResult.value;

    let builderUrl = getBuilderUrl({
      host: this.context.config.mproveCliHost,
      orgId: mergeRepoOutput.repo.orgId,
      projectId: this.projectId,
      repoId: mergeRepoOutput.repo.repoId,
      branch: this.branch,
      env: this.env
    });

    let log: any = {
      message: `Merged branch "${this.theirBranch}" to "${this.branch}"`,
      validationErrorsTotal: mergeRepoOutput.struct.errors.length
    };

    if (this.getRepo === true) {
      let repo = mergeRepoOutput.repo;

      delete repo.nodes;
      delete repo.changesToCommit;
      delete repo.changesToPush;

      log.repo = repo;
    }

    if (this.getErrors === true) {
      log.validationErrors = mapBmlErrorsToMproveValidationErrors({
        errors: mergeRepoOutput.struct.errors
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
