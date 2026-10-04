import { Command, Option } from 'clipanion';
import * as t from 'typanion';
import { ServerError } from '#common/classes/server-error/server-error';
import { PROD_REPO_ID } from '#common/constants/top';
import { getBuilderUrl } from '#common/functions/get-builder-url/get-builder-url';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import { mapBmlErrorsToMproveValidationErrors } from '#common/functions/map-bml-errors-to-mprove-validation-errors/map-bml-errors-to-mprove-validation-errors';
import type { ToBackendPullRepoOutput } from '#common/types/backend/routes/repos/pull-repo/pull-repo-output';
import type { ToBackendPullRepoRequest } from '#common/types/backend/routes/repos/pull-repo/pull-repo-request';
import { zRepoType } from '#common/types/disk/parts/repo/repo-type';
import { CustomCommand } from '#mcli/classes/custom-command/custom-command';
import { getConfig } from '#mcli/config/get.config';
import { mreq } from '#mcli/functions/mreq/mreq';
import { logToConsoleMcli } from '#mcli/functions/top/log-to-console-mcli/log-to-console-mcli';

export class PullCommand extends CustomCommand {
  static paths = [['pull']];

  static usage = Command.Usage({
    description:
      'Pull committed changes from Remote to repo, validate Mprove Files for selected env',
    examples: [
      [
        'Pull committed changes from Remote to Dev repo, validate Mprove Files for env prod',
        'mprove pull --project-id DXYE72ODCP5LWPWH2EXQ --repo-type dev --branch main --env prod'
      ],
      [
        'Pull committed changes from Remote to Production repo, validate Mprove Files for env prod',
        'mprove pull --project-id DXYE72ODCP5LWPWH2EXQ --repo-type production --branch main --env prod'
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
    description: '(required) Git Branch'
  });

  env = Option.String('--env', 'prod', {
    description: '(default "prod") Environment'
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

    let pullRepoReqPayload: ToBackendPullRepoRequest['input'] = {
      projectId: this.projectId,
      repoId: repoId,
      branchId: this.branch,
      envId: this.env
    };

    let pullRepoOutput: ToBackendPullRepoOutput = await mreq({
      apiKey: apiKey,
      route: 'api/ToBackendPullRepo',
      payload: pullRepoReqPayload,
      host: this.context.config.mproveCliHost
    });

    let builderUrl = getBuilderUrl({
      host: this.context.config.mproveCliHost,
      orgId: pullRepoOutput.repo.orgId,
      projectId: this.projectId,
      repoId: pullRepoOutput.repo.repoId,
      branch: this.branch,
      env: this.env
    });

    let log: any = {
      message: `Pulled changes from Remote`,
      validationErrorsTotal: pullRepoOutput.struct.errors.length
    };

    if (this.getRepo === true) {
      let repo = pullRepoOutput.repo;

      delete repo.nodes;
      delete repo.changesToCommit;
      delete repo.changesToPush;

      log.repo = repo;
    }

    if (this.getErrors === true) {
      log.validationErrors = mapBmlErrorsToMproveValidationErrors({
        errors: pullRepoOutput.struct.errors
      });
    }

    log.url = builderUrl;

    logToConsoleMcli({
      log: log,
      logLevel: 'Info',
      context: this.context,
      isJson: this.json
    });
  }
}
