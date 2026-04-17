import { Command, Option } from 'clipanion';
import * as t from 'typanion';
import { PROD_REPO_ID } from '#common/constants/top';
import { ApiKeyTypeEnum } from '#common/enums/api-key-type.enum';
import { ErEnum } from '#common/enums/er.enum';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { RepoTypeEnum } from '#common/enums/repo-type.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { isUndefined } from '#common/functions/is-undefined';
import { ServerError } from '#common/models/server-error';
import type {
  ToBackendCreateBranchRequestPayload,
  ToBackendCreateBranchResponse
} from '#common/zod/to-backend/branches/to-backend-create-branch';
import { getConfig } from '#mcli/config/get.config';
import { logToConsoleMcli } from '#mcli/functions/log-to-console-mcli';
import { mreq } from '#mcli/functions/mreq';
import { CustomCommand } from '#mcli/models/custom-command';

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

    let createBranchReqPayload: ToBackendCreateBranchRequestPayload = {
      projectId: this.projectId,
      repoId: repoId,
      newBranchId: this.newBranch,
      fromBranchId: this.fromBranch
    };

    let createBranchResp = await mreq<ToBackendCreateBranchResponse>({
      apiKey: apiKey,
      pathInfoName: ToBackendRequestInfoNameEnum.ToBackendCreateBranch,
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
