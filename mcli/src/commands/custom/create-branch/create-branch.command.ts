import { Result } from '@praha/byethrow';
import { Command, Option } from 'clipanion';
import * as t from 'typanion';
import { PROD_REPO_ID } from '#common/constants/top';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { ToBackendCreateBranchOutput } from '#common/types/backend/routes/branches/create-branch/create-branch-output';
import type { ToBackendCreateBranchRequest } from '#common/types/backend/routes/branches/create-branch/create-branch-request';
import type { ToBackendCreateBranchResponse } from '#common/types/backend/routes/branches/create-branch/create-branch-response';
import {
  type RepoType,
  repoTypeValues
} from '#common/types/disk/parts/repo/repo-type';
import { CustomCommand } from '#mcli/classes/custom-command/custom-command';
import { getApiKeyRepoIdResult } from '#mcli/functions/get-api-key-repo-id-result/get-api-key-repo-id-result';
import { mreqResult } from '#mcli/functions/mreq-result/mreq-result';
import { logToConsoleMcli } from '#mcli/functions/top/log-to-console-mcli/log-to-console-mcli';
import type { CreateBranchCommandError } from '#mcli/types/function-errors/create-branch-command-error';
import type { GetApiKeyRepoIdError } from '#mcli/types/function-errors/get-api-key-repo-id-error';
import type { MreqError } from '#mcli/types/function-errors/mreq-error';

export class CreateBranchCommand extends CustomCommand {
  static paths = [['create-branch']];

  static usage = Command.Usage({
    description: 'Create branch',
    examples: [
      [
        'Create branch for Dev repo',
        'mprove create-branch --project-id DXYE72ODCP5LWPWH2EXQ --repo-type dev --new-branch b1 --from-branch main'
      ],
      [
        'Create branch for Production repo',
        'mprove create-branch --project-id DXYE72ODCP5LWPWH2EXQ --repo-type production --new-branch b1 --from-branch main'
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

  newBranch = Option.String('--new-branch', {
    required: true,
    description: '(required) New Branch name'
  });

  fromBranch = Option.String('--from-branch', {
    required: true,
    description: '(required) From Branch name'
  });

  json = Option.Boolean('--json', false, {
    description: '(default false)'
  });

  envFilePath = Option.String('--env-file-path', {
    description: '(optional) Path to ".env" file'
  });

  override async act(): Result.ResultAsync<void, CreateBranchCommandError> {
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

    let createBranchReqPayload: ToBackendCreateBranchRequest['input'] = {
      projectId: this.projectId,
      repoId: repoId,
      newBranchId: this.newBranch,
      fromBranchId: this.fromBranch
    };

    let createBranchOutputResult: Result.Result<
      ToBackendCreateBranchOutput,
      MreqError<ToBackendCreateBranchResponse>
    > = await mreqResult({
      apiKey: apiKey,
      route: 'api/ToBackendCreateBranch',
      payload: createBranchReqPayload,
      host: this.context.config.mproveCliHost
    });

    if (Result.isFailure(createBranchOutputResult)) {
      return createBranchOutputResult;
    }

    let createBranchOutput: ToBackendCreateBranchOutput =
      createBranchOutputResult.value;

    let log: any = {
      message: `Created branch "${this.newBranch}"`
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
