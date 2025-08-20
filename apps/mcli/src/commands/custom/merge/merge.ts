import { Command, Option } from 'clipanion';
import { getConfig } from '~mcli/config/get.config';
import { getFilesUrl } from '~mcli/functions/get-files-url';
import { getLoginToken } from '~mcli/functions/get-login-token';
import { logToConsoleMcli } from '~mcli/functions/log-to-console-mcli';
import { mreq } from '~mcli/functions/mreq';
import { CustomCommand } from '~mcli/models/custom-command';

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

    let mergeRepoReqPayload: ToBackendMergeRepoRequestPayload = {
      projectId: this.projectId,
      branchId: this.branch,
      theirBranchId: this.theirBranch,
      envId: this.env
    };

    let mergeRepoResp = await mreq<ToBackendMergeRepoResponse>({
      loginToken: loginToken,
      pathInfoName: ToBackendRequestInfoNameEnum.ToBackendMergeRepo,
      payload: mergeRepoReqPayload,
      host: this.context.config.mproveCliHost
    });

    let filesUrl = getFilesUrl({
      host: this.context.config.mproveCliHost,
      orgId: mergeRepoResp.payload.repo.orgId,
      projectId: this.projectId,
      repoId: mergeRepoResp.payload.repo.repoId,
      branch: this.branch,
      env: this.env
    });

    let log: any = {
      message: `Merged branch "${this.theirBranch}" to "${this.branch}"`,
      validationErrorsTotal: mergeRepoResp.payload.struct.errors.length
    };

    if (this.getRepo === true) {
      let repo = mergeRepoResp.payload.repo;

      delete repo.nodes;
      delete repo.changesToCommit;
      delete repo.changesToPush;

      log.repo = repo;
    }

    if (this.getErrors === true) {
      log.validationErrors = mergeRepoResp.payload.struct.errors;
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
