import { Command, Option } from 'clipanion';
import * as t from 'typanion';
import { ServerError } from '#common/classes/server-error/server-error';
import { PROD_REPO_ID } from '#common/constants/top';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { ToBackendDeleteBranchOutput } from '#common/types/backend/routes/branches/delete-branch/delete-branch-output';
import type { ToBackendDeleteBranchRequest } from '#common/types/backend/routes/branches/delete-branch/delete-branch-request';
import { zRepoType } from '#common/types/disk/parts/repo/repo-type';
import { CustomCommand } from '#mcli/classes/custom-command/custom-command';
import { getConfig } from '#mcli/config/get.config';
import { mreq } from '#mcli/functions/mreq/mreq';
import { logToConsoleMcli } from '#mcli/functions/top/log-to-console-mcli/log-to-console-mcli';

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
    validator: t.isEnum(zRepoType.options),
    description: `(required, "dev", "production" or "session")`
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
        : apiKey.startsWith(`SK-`)
          ? apiKey.split('-')[2].toLowerCase()
          : apiKey.split('-')[2];

    let deleteBranchReqPayload: ToBackendDeleteBranchRequest['input'] = {
      projectId: this.projectId,
      repoId: repoId,
      branchId: this.branch
    };

    let deleteBranchOutput: ToBackendDeleteBranchOutput = await mreq({
      apiKey: apiKey,
      route: 'api/ToBackendDeleteBranch',
      payload: deleteBranchReqPayload,
      host: this.context.config.mproveCliHost
    });

    let log: any = {
      message: `Deleted branch "${this.branch}"`
    };

    logToConsoleMcli({
      log: log,
      logLevel: 'Info',
      context: this.context,
      isJson: this.json
    });
  }
}
