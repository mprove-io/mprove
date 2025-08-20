import { Command, Option } from 'clipanion';
import * as t from 'typanion';
import { getConfig } from '~mcli/config/get.config';
import { getFilesUrl } from '~mcli/functions/get-files-url';
import { getLoginToken } from '~mcli/functions/get-login-token';
import { logToConsoleMcli } from '~mcli/functions/log-to-console-mcli';
import { mreq } from '~mcli/functions/mreq';
import { CustomCommand } from '~mcli/models/custom-command';

export class ValidateCommand extends CustomCommand {
  static paths = [['validate']];

  static usage = Command.Usage({
    description: 'Validate (rebuild) Mprove Files for selected env',
    examples: [
      [
        'Validate Mprove Files for Dev repo, env prod',
        'mprove validate --project-id DXYE72ODCP5LWPWH2EXQ --repo dev --branch main --env prod'
      ],
      [
        'Validate Mprove Files for Production repo, env prod',
        'mprove validate --project-id DXYE72ODCP5LWPWH2EXQ --repo production --branch main --env prod'
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

    let isRepoProd = this.repo === 'production' ? true : false;

    let loginToken = await getLoginToken(this.context);

    let validateFilesReqPayload: ToBackendValidateFilesRequestPayload = {
      projectId: this.projectId,
      isRepoProd: isRepoProd,
      branchId: this.branch,
      envId: this.env
    };

    let validateFilesResp = await mreq<ToBackendValidateFilesResponse>({
      loginToken: loginToken,
      pathInfoName: ToBackendRequestInfoNameEnum.ToBackendValidateFiles,
      payload: validateFilesReqPayload,
      host: this.context.config.mproveCliHost
    });

    let filesUrl = getFilesUrl({
      host: this.context.config.mproveCliHost,
      orgId: validateFilesResp.payload.repo.orgId,
      projectId: this.projectId,
      repoId: validateFilesResp.payload.repo.repoId,
      branch: this.branch,
      env: this.env
    });

    let log: any = {
      message: `Validation completed`,
      validationErrorsTotal: validateFilesResp.payload.struct.errors.length
    };

    if (this.getRepo === true) {
      let repo = validateFilesResp.payload.repo;

      delete repo.nodes;
      delete repo.changesToCommit;
      delete repo.changesToPush;

      log.repo = repo;
    }

    if (this.getErrors === true) {
      log.validationErrors = validateFilesResp.payload.struct.errors;
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
