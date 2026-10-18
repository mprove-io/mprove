import { Result } from '@praha/byethrow';
import { Command, Option } from 'clipanion';
import * as t from 'typanion';
import { PROD_REPO_ID } from '#common/constants/top';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { ToBackendDeleteBranchOutput } from '#common/types/backend/routes/branches/delete-branch/delete-branch-output';
import type { ToBackendDeleteBranchRequest } from '#common/types/backend/routes/branches/delete-branch/delete-branch-request';
import type { ToBackendDeleteBranchResponse } from '#common/types/backend/routes/branches/delete-branch/delete-branch-response';
import {
  type RepoType,
  repoTypeValues
} from '#common/types/disk/parts/repo/repo-type';
import { CustomCommand } from '#mcli/classes/custom-command/custom-command';
import { getApiKeyRepoId } from '#mcli/functions/get-api-key-repo-id/get-api-key-repo-id';
import { mreq } from '#mcli/functions/mreq/mreq';
import { logToConsoleMcli } from '#mcli/functions/top/log-to-console-mcli/log-to-console-mcli';
import type { DeleteBranchCommandError } from '#mcli/types/function-errors/delete-branch-command-error';
import type { GetApiKeyRepoIdError } from '#mcli/types/function-errors/get-api-key-repo-id-error';
import type { MreqError } from '#mcli/types/function-errors/mreq-error';

export class DeleteBranchCommand extends CustomCommand {
  static paths = [['delete-branch']];

  static usage = Command.Usage({
    description: 'Delete branch',
    examples: [
      [
        'Delete branch for Dev repo',
        'mprove delete-branch --project-id DXYE72ODCP5LWPWH2EXQ --repo-type dev --branch b1'
      ],
      [
        'Delete branch for Production repo',
        'mprove delete-branch --project-id DXYE72ODCP5LWPWH2EXQ --repo-type production --branch b1'
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
    description: '(required) Branch name'
  });

  json = Option.Boolean('--json', false, {
    description: '(default false)'
  });

  envFilePath = Option.String('--env-file-path', {
    description: '(optional) Path to ".env" file'
  });

  override async act(): Result.ResultAsync<void, DeleteBranchCommandError> {
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

    let deleteBranchReqPayload: ToBackendDeleteBranchRequest['input'] = {
      projectId: this.projectId,
      repoId: repoId,
      branchId: this.branch
    };

    let deleteBranchOutputResult: Result.Result<
      ToBackendDeleteBranchOutput,
      MreqError<ToBackendDeleteBranchResponse>
    > = await mreq({
      apiKey: apiKey,
      route: 'api/ToBackendDeleteBranch',
      payload: deleteBranchReqPayload,
      host: this.context.config.mproveCliHost
    });

    if (Result.isFailure(deleteBranchOutputResult)) {
      return deleteBranchOutputResult;
    }

    let deleteBranchOutput: ToBackendDeleteBranchOutput =
      deleteBranchOutputResult.value;

    let log: any = {
      message: `Deleted branch "${this.branch}"`
    };

    logToConsoleMcli({
      log: log,
      logLevel: 'Info',
      context: this.context,
      isJson: this.json
    });

    return Result.succeed();
  }
}
