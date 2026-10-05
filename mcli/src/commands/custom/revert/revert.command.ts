import { Command, Option } from 'clipanion';
import * as t from 'typanion';
import { ServerError } from '#common/classes/server-error/server-error';
import { PROD_REPO_ID } from '#common/constants/top';
import { getBuilderUrl } from '#common/functions/get-builder-url/get-builder-url';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import { mapBmlErrorsToMproveValidationErrors } from '#common/functions/map-bml-errors-to-mprove-validation-errors/map-bml-errors-to-mprove-validation-errors';
import type { ApiKeyType } from '#common/types/backend/parts/api-key/api-key-type';
import type { ToBackendRevertRepoToLastCommitOutput } from '#common/types/backend/routes/repos/revert-repo-to-last-commit/revert-repo-to-last-commit-output';
import type { ToBackendRevertRepoToLastCommitRequest } from '#common/types/backend/routes/repos/revert-repo-to-last-commit/revert-repo-to-last-commit-request';
import type { ToBackendRevertRepoToRemoteOutput } from '#common/types/backend/routes/repos/revert-repo-to-remote/revert-repo-to-remote-output';
import type { ToBackendRevertRepoToRemoteRequest } from '#common/types/backend/routes/repos/revert-repo-to-remote/revert-repo-to-remote-request';
import {
  type RepoType,
  zRepoType
} from '#common/types/disk/parts/repo/repo-type';
import { CustomCommand } from '#mcli/classes/custom-command/custom-command';
import { type To, zTo } from '#mcli/commands/custom/revert/to';
import { getConfig } from '#mcli/config/get.config';
import { mreq } from '#mcli/functions/mreq/mreq';
import { logToConsoleMcli } from '#mcli/functions/top/log-to-console-mcli/log-to-console-mcli';

export class RevertCommand extends CustomCommand {
  static paths = [['revert']];

  static usage = Command.Usage({
    description:
      'Revert (reset) repo to the state of a last commit or Remote repo, validate Mprove Files for selected env',
    examples: [
      [
        'Revert Dev repo to the state of a last commit, validate Mprove Files for env prod',
        'mprove revert --to last-commit --project-id DXYE72ODCP5LWPWH2EXQ --repo-type dev --branch main --env prod'
      ],
      [
        'Revert Production repo to the state of Remote repo, validate Mprove Files for env prod',
        'mprove revert --to remote --project-id DXYE72ODCP5LWPWH2EXQ --repo-type production --branch main --env prod'
      ]
    ]
  });

  to = Option.String('--to', {
    required: true,
    validator: t.isEnum(zTo.options),
    description: `(required, "${'last-commit' satisfies To}" or "${'remote' satisfies To}")`
  });

  projectId = Option.String('--project-id', {
    description: '(required) Project Id'
  });

  repoType = Option.String('--repo-type', {
    required: true,
    validator: t.isEnum(zRepoType.options),
    description: `(required, "${'dev' satisfies RepoType}", "${'production' satisfies RepoType}" or "${'session' satisfies RepoType}")`
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
        : apiKey.startsWith(`${'SK' satisfies ApiKeyType}-`)
          ? apiKey.split('-')[2].toLowerCase()
          : apiKey.split('-')[2];

    let revertRepoOutput:
      | ToBackendRevertRepoToLastCommitOutput
      | ToBackendRevertRepoToRemoteOutput;

    if (this.to === 'last-commit') {
      let revertRepoToLastCommitReqPayload: ToBackendRevertRepoToLastCommitRequest['input'] =
        {
          projectId: this.projectId,
          repoId: repoId,
          branchId: this.branch,
          envId: this.env
        };

      revertRepoOutput = await mreq({
        apiKey: apiKey,
        route: 'api/ToBackendRevertRepoToLastCommit',
        payload: revertRepoToLastCommitReqPayload,
        host: this.context.config.mproveCliHost
      });
    } else {
      let revertRepoToRemoteReqPayload: ToBackendRevertRepoToRemoteRequest['input'] =
        {
          projectId: this.projectId,
          repoId: repoId,
          branchId: this.branch,
          envId: this.env
        };

      revertRepoOutput = await mreq({
        apiKey: apiKey,
        route: 'api/ToBackendRevertRepoToRemote',
        payload: revertRepoToRemoteReqPayload,
        host: this.context.config.mproveCliHost
      });
    }

    let builderUrl = getBuilderUrl({
      host: this.context.config.mproveCliHost,
      orgId: revertRepoOutput.repo.orgId,
      projectId: this.projectId,
      repoId: revertRepoOutput.repo.repoId,
      branch: this.branch,
      env: this.env
    });

    let log: any = {
      message: `Reverted repo state to ${this.to}`,
      validationErrorsTotal: revertRepoOutput.struct.errors.length
    };

    if (this.getRepo === true) {
      let repo = revertRepoOutput.repo;

      delete repo.nodes;
      delete repo.changesToCommit;
      delete repo.changesToPush;

      log.repo = repo;
    }

    if (this.getErrors === true) {
      log.validationErrors = mapBmlErrorsToMproveValidationErrors({
        errors: revertRepoOutput.struct.errors
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
