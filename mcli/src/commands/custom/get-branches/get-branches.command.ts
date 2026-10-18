import { Result } from '@praha/byethrow';
import { Command, Option } from 'clipanion';
import * as t from 'typanion';
import { PROD_REPO_ID } from '#common/constants/top';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { ToBackendGetBranchesListOutput } from '#common/types/backend/routes/branches/get-branches-list/get-branches-list-output';
import type { ToBackendGetBranchesListRequest } from '#common/types/backend/routes/branches/get-branches-list/get-branches-list-request';
import type { ToBackendGetBranchesListResponse } from '#common/types/backend/routes/branches/get-branches-list/get-branches-list-response';
import {
  type RepoType,
  repoTypeValues
} from '#common/types/disk/parts/repo/repo-type';
import { CustomCommand } from '#mcli/classes/custom-command/custom-command';
import { getApiKeyRepoId } from '#mcli/functions/get-api-key-repo-id/get-api-key-repo-id';
import { mreq } from '#mcli/functions/mreq/mreq';
import { logToConsoleMcli } from '#mcli/functions/top/log-to-console-mcli/log-to-console-mcli';
import type { GetApiKeyRepoIdError } from '#mcli/types/function-errors/get-api-key-repo-id-error';
import type { GetBranchesCommandError } from '#mcli/types/function-errors/get-branches-command-error';
import type { MreqError } from '#mcli/types/function-errors/mreq-error';

export class GetBranchesCommand extends CustomCommand {
  static paths = [['get-branches']];

  static usage = Command.Usage({
    description: 'Get branches',
    examples: [
      [
        'Get Dev repo branches',
        'mprove get-branches --project-id DXYE72ODCP5LWPWH2EXQ --repo-type dev'
      ],
      [
        'Get Production repo branches',
        'mprove get-branches --project-id DXYE72ODCP5LWPWH2EXQ --repo-type production'
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

  json = Option.Boolean('--json', false, {
    description: '(default false)'
  });

  envFilePath = Option.String('--env-file-path', {
    description: '(optional) Path to ".env" file'
  });

  override async act(): Result.ResultAsync<void, GetBranchesCommandError> {
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

    let getBranchesListReqPayload: ToBackendGetBranchesListRequest['input'] = {
      projectId: this.projectId
    };

    let getBranchesListOutputResult: Result.Result<
      ToBackendGetBranchesListOutput,
      MreqError<ToBackendGetBranchesListResponse>
    > = await mreq({
      apiKey: apiKey,
      route: 'api/ToBackendGetBranchesList',
      payload: getBranchesListReqPayload,
      host: this.context.config.mproveCliHost
    });

    if (Result.isFailure(getBranchesListOutputResult)) {
      return getBranchesListOutputResult;
    }

    let getBranchesListOutput: ToBackendGetBranchesListOutput =
      getBranchesListOutputResult.value;

    let log: any = {
      branches: getBranchesListOutput.branchesList
        .filter(x => x.repoId === repoId)
        .map(b => b.branchId)
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
