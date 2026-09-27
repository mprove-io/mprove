import { Command, Option } from 'clipanion';
import * as t from 'typanion';
import { ServerError } from '#common/classes/server-error/server-error';
import { PROD_REPO_ID } from '#common/constants/top';
import { ApiKeyTypeEnum } from '#common/enums/api-key-type.enum';
import { ErEnum } from '#common/enums/er.enum';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { RepoTypeEnum } from '#common/enums/repo-type.enum';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { ToBackendCreateBranchInput } from '#common/zod/backend/routes/branches/create-branch/create-branch-request';
import type { ToBackendCreateBranchOutput } from '#common/zod/backend/routes/branches/create-branch/create-branch-response';
import { CustomCommand } from '#mcli/classes/custom-command/custom-command';
import { getConfig } from '#mcli/config/get.config';
import { mreq } from '#mcli/functions/mreq/mreq';
import { logToConsoleMcli } from '#mcli/functions/top/log-to-console-mcli/log-to-console-mcli';

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
    validator: t.isEnum(RepoTypeEnum),
    description: `(required, "${RepoTypeEnum.Dev}", "${RepoTypeEnum.Production}" or "${RepoTypeEnum.Session}")`
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

  async execute() {
    if (isUndefined(this.context.config)) {
      this.context.config = getConfig(this.envFilePath);
    }

    this.projectId = this.projectId || this.context.config.mproveCliProjectId;

    if (isUndefined(this.projectId)) {
      let serverError = new ServerError({
        message: ErEnum.MCLI_PROJECT_ID_IS_NOT_DEFINED,
        originalError: null
      });
      throw serverError;
    }

    let apiKey = this.context.config.mproveCliApiKey;

    let repoId =
      this.repoType === RepoTypeEnum.Production
        ? PROD_REPO_ID
        : apiKey.startsWith(`${ApiKeyTypeEnum.SK}-`)
          ? apiKey.split('-')[2].toLowerCase()
          : apiKey.split('-')[2];

    let createBranchReqPayload: ToBackendCreateBranchInput = {
      projectId: this.projectId,
      repoId: repoId,
      newBranchId: this.newBranch,
      fromBranchId: this.fromBranch
    };

    let createBranchOutput: ToBackendCreateBranchOutput = await mreq({
      apiKey: apiKey,
      route: 'api/ToBackendCreateBranch',
      payload: createBranchReqPayload,
      host: this.context.config.mproveCliHost
    });

    let log: any = {
      message: `Created branch "${this.newBranch}"`
    };

    logToConsoleMcli({
      log: log,
      logLevel: LogLevelEnum.Info,
      context: this.context,
      isJson: this.json
    });
  }
}
