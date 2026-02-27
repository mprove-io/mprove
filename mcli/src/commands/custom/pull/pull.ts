import { Command, Option } from 'clipanion';
import * as t from 'typanion';
import { PROD_REPO_ID } from '#common/constants/top';
import { ErEnum } from '#common/enums/er.enum';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { RepoParameterEnum } from '#common/enums/repo-parameter.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { isUndefined } from '#common/functions/is-undefined';
import {
  ToBackendPullRepoRequestPayload,
  ToBackendPullRepoResponse
} from '#common/interfaces/to-backend/repos/to-backend-pull-repo';
import { ServerError } from '#common/models/server-error';
import { getConfig } from '#mcli/config/get.config';
import { getBuilderUrl } from '#mcli/functions/get-builder-url';
import { getLoginToken } from '#mcli/functions/get-login-token';
import { logToConsoleMcli } from '#mcli/functions/log-to-console-mcli';
import { mreq } from '#mcli/functions/mreq';
import { CustomCommand } from '#mcli/models/custom-command';

export class PullCommand extends CustomCommand {
  static paths = [['pull']];

  static usage = Command.Usage({
    description:
      'Pull committed changes from Remote to repo, validate Mprove Files for selected env',
    examples: [
      [
        'Pull committed changes from Remote to Dev repo, validate Mprove Files for env prod',
        'mprove pull --project-id DXYE72ODCP5LWPWH2EXQ --repo dev --branch main --env prod'
      ],
      [
        'Pull committed changes from Remote to Production repo, validate Mprove Files for env prod',
        'mprove pull --project-id DXYE72ODCP5LWPWH2EXQ --repo production --branch main --env prod'
      ]
    ]
  });

  projectId = Option.String('--project-id', {
    description: '(required) Project Id'
  });

  repo = Option.String('--repo', {
    required: true,
    validator: t.isEnum(RepoParameterEnum),
    description: `(required, "${RepoParameterEnum.Dev}" or "${RepoParameterEnum.Production}")`
  });

  branch = Option.String('--branch', {
    required: true,
    description: '(required) Git Branch'
  });

  env = Option.String('--env', {
    required: true,
    description: '(required) Environment'
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

    let loginToken = await getLoginToken(this.context);

    let repoId =
      this.repo === 'production' ? PROD_REPO_ID : this.context.userId;

    let pullRepoReqPayload: ToBackendPullRepoRequestPayload = {
      projectId: this.projectId,
      repoId: repoId,
      branchId: this.branch,
      envId: this.env
    };

    let pullRepoResp = await mreq<ToBackendPullRepoResponse>({
      loginToken: loginToken,
      pathInfoName: ToBackendRequestInfoNameEnum.ToBackendPullRepo,
      payload: pullRepoReqPayload,
      host: this.context.config.mproveCliHost
    });

    let builderUrl = getBuilderUrl({
      host: this.context.config.mproveCliHost,
      orgId: pullRepoResp.payload.repo.orgId,
      projectId: this.projectId,
      repoId: pullRepoResp.payload.repo.repoId,
      branch: this.branch,
      env: this.env
    });

    let log: any = {
      message: `Pulled changes from Remote`,
      validationErrorsTotal: pullRepoResp.payload.struct.errors.length
    };

    if (this.getRepo === true) {
      let repo = pullRepoResp.payload.repo;

      delete repo.nodes;
      delete repo.changesToCommit;
      delete repo.changesToPush;

      log.repo = repo;
    }

    if (this.getErrors === true) {
      log.validationErrors = pullRepoResp.payload.struct.errors;
    }

    log.url = builderUrl;

    logToConsoleMcli({
      log: log,
      logLevel: LogLevelEnum.Info,
      context: this.context,
      isJson: this.json
    });
  }
}
