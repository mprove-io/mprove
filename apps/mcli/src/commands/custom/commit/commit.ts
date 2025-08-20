import { Command, Option } from 'clipanion';
import * as t from 'typanion';
import { PROJECT_ENV_PROD } from '~common/constants/top';
import { ErEnum } from '~common/enums/er.enum';
import { LogLevelEnum } from '~common/enums/log-level.enum';
import { RepoEnum } from '~common/enums/repo.enum';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import { isUndefined } from '~common/functions/is-undefined';
import {
  ToBackendCommitRepoRequestPayload,
  ToBackendCommitRepoResponse
} from '~common/interfaces/to-backend/repos/to-backend-commit-repo';
import { ServerError } from '~common/models/server-error';
import { getConfig } from '~mcli/config/get.config';
import { getFilesUrl } from '~mcli/functions/get-files-url';
import { getLoginToken } from '~mcli/functions/get-login-token';
import { logToConsoleMcli } from '~mcli/functions/log-to-console-mcli';
import { mreq } from '~mcli/functions/mreq';
import { CustomCommand } from '~mcli/models/custom-command';

export class CommitCommand extends CustomCommand {
  static paths = [['commit']];

  static usage = Command.Usage({
    description: 'Commit changes',
    examples: [
      [
        'Commit changes for Dev repo',
        'mprove commit --project-id DXYE72ODCP5LWPWH2EXQ --repo dev --branch main --commit-message ms1'
      ]
    ]
  });

  projectId = Option.String('--project-id', {
    description: '(required) Project Id'
  });

  repo = Option.String('--repo', {
    required: true,
    validator: t.isEnum(RepoEnum),
    description: `(required, "${RepoEnum.Dev}" or "${RepoEnum.Production}")`
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

    let isRepoProd = this.repo === 'production' ? true : false;

    let loginToken = await getLoginToken(this.context);

    let commitRepoReqPayload: ToBackendCommitRepoRequestPayload = {
      projectId: this.projectId,
      isRepoProd: isRepoProd,
      branchId: this.branch,
      commitMessage: this.commitMessage
    };

    let commitRepoResp = await mreq<ToBackendCommitRepoResponse>({
      loginToken: loginToken,
      pathInfoName: ToBackendRequestInfoNameEnum.ToBackendCommitRepo,
      payload: commitRepoReqPayload,
      host: this.context.config.mproveCliHost
    });

    let filesUrl = getFilesUrl({
      host: this.context.config.mproveCliHost,
      orgId: commitRepoResp.payload.repo.orgId,
      projectId: this.projectId,
      repoId: commitRepoResp.payload.repo.repoId,
      branch: this.branch,
      env: PROJECT_ENV_PROD
    });

    let log: any = {
      message: `Created commit "${this.commitMessage}"`
    };

    if (this.getRepo === true) {
      let repo = commitRepoResp.payload.repo;

      delete repo.nodes;
      delete repo.changesToCommit;
      delete repo.changesToPush;

      log.repo = repo;
    }

    log.url = filesUrl;

    logToConsoleMcli({
      log: log,
      logLevel: LogLevelEnum.Info,
      context: this.context,
      isJson: this.json
    });
  }
}
