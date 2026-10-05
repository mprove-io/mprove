import { Command, Option } from 'clipanion';
import * as t from 'typanion';
import { ServerError } from '#common/classes/server-error/server-error';
import { PROD_REPO_ID } from '#common/constants/top';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { ApiKeyType } from '#common/types/backend/parts/api-key/api-key-type';
import type { ToBackendGetBranchesListOutput } from '#common/types/backend/routes/branches/get-branches-list/get-branches-list-output';
import type { ToBackendGetBranchesListRequest } from '#common/types/backend/routes/branches/get-branches-list/get-branches-list-request';
import {
  type RepoType,
  zRepoType
} from '#common/types/disk/parts/repo/repo-type';
import { CustomCommand } from '#mcli/classes/custom-command/custom-command';
import { getConfig } from '#mcli/config/get.config';
import { mreq } from '#mcli/functions/mreq/mreq';
import { logToConsoleMcli } from '#mcli/functions/top/log-to-console-mcli/log-to-console-mcli';

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
    validator: t.isEnum(zRepoType.options),
    description: `(required, "${'dev' satisfies RepoType}", "${'production' satisfies RepoType}" or "${'session' satisfies RepoType}")`
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

    let getBranchesListReqPayload: ToBackendGetBranchesListRequest['input'] = {
      projectId: this.projectId
    };

    let getBranchesListOutput: ToBackendGetBranchesListOutput = await mreq({
      apiKey: apiKey,
      route: 'api/ToBackendGetBranchesList',
      payload: getBranchesListReqPayload,
      host: this.context.config.mproveCliHost
    });

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
  }
}
