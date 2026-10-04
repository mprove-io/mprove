import { Result } from '@praha/byethrow';
import { Command, Option } from 'clipanion';
import deepEqual from 'fast-deep-equal';
import { ServerError } from '#common/classes/server-error/server-error';

import { getBuilderUrl } from '#common/functions/get-builder-url/get-builder-url';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import { mapBmlErrorsToMproveValidationErrors } from '#common/functions/map-bml-errors-to-mprove-validation-errors/map-bml-errors-to-mprove-validation-errors';
import type { ToBackendSyncRepoOutput } from '#common/types/backend/routes/repos/sync-repo/sync-repo-output';
import type { ToBackendSyncRepoRequest } from '#common/types/backend/routes/repos/sync-repo/sync-repo-request';
import { CustomCommand } from '#mcli/classes/custom-command/custom-command';
import { getConfig } from '#mcli/config/get.config';
import { mreq } from '#mcli/functions/mreq/mreq';
import { logToConsoleMcli } from '#mcli/functions/top/log-to-console-mcli/log-to-console-mcli';
import { applySyncPayload } from '#node-common/functions/apply-sync-payload/apply-sync-payload';
import { createSimpleGit } from '#node-common/functions/create-simple-git/create-simple-git';
import { getChangesToCommit } from '#node-common/functions/get-changes-to-commit/get-changes-to-commit';
import { getSyncAppliedChanges } from '#node-common/functions/get-sync-applied-changes/get-sync-applied-changes';
import { getSyncFilesPayload } from '#node-common/functions/get-sync-files-payload/get-sync-files-payload';
import { resetWorkingTreeToHead } from '#node-common/functions/reset-working-tree-to-head/reset-working-tree-to-head';

export class SyncCommand extends CustomCommand {
  static paths = [['sync']];

  static usage = Command.Usage({
    description: `Overwrite SERVER repo state using local repo state and vice versa, depending on the "--from-server" option`,
    examples: [
      ['Apply LOCAL uncommitted repo state to the server repo', 'mprove sync'],
      [
        'Apply SERVER uncommitted repo state to the local repo',
        'mprove sync --from-server'
      ]
    ]
  });

  projectId = Option.String('--project-id', {
    description: 'Project Id'
  });

  env = Option.String('--env', 'prod', {
    description: '(default "prod") Environment'
  });

  localPath = Option.String('--local-path', {
    description:
      '(optional, if not specified then the current working directory is used) Absolute path of local git repository'
  });

  fromServer = Option.Boolean('--from-server', false, {
    description:
      '(default false) if set, then server uncommitted changes overwrite local uncommitted changes'
  });

  getRepo = Option.Boolean('--get-repo', false, {
    description: '(default false), show repo in output'
  });

  getRepoNodes = Option.Boolean('--get-repo-nodes', false, {
    description: '(default false), show repo nodes in output'
  });

  getErrors = Option.Boolean('--get-errors', false, {
    description: '(default false), show validation errors in output'
  });

  json = Option.Boolean('--json', false, {
    description: '(default false)'
  });

  debug = Option.Boolean('--debug', false, {
    description: '(default false) add debug to output'
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

    let repoDir = isDefined(this.localPath) ? this.localPath : process.cwd();

    let git = createSimpleGit({ baseDir: repoDir });

    let branchSummary = await git.branch();

    let currentBranchName = branchSummary.current;

    let logResult = await git.log(['-1']);

    let lastCommit = logResult.latest?.hash;

    let statusResult = await git.status();

    let localPayload =
      this.fromServer === true
        ? { changedFiles: [], deletedFiles: [] }
        : await Result.unwrap(
            Result.pipe(
              getSyncFilesPayload({
                repoDir: repoDir,
                statusResult: statusResult
              }),
              Result.mapError(error => new ServerError({ message: error.code }))
            )
          );

    let changedFiles = localPayload.changedFiles;
    let deletedFiles = localPayload.deletedFiles;

    let apiKey = this.context.config.mproveCliApiKey;

    let repoId = apiKey.startsWith(`SK-`)
      ? apiKey.split('-')[2].toLowerCase()
      : apiKey.split('-')[2];

    let syncRepoReqPayload: ToBackendSyncRepoRequest['input'];
    if (this.fromServer === true) {
      syncRepoReqPayload = {
        direction: 'from-server',
        projectId: this.projectId,
        repoId: repoId,
        branchId: currentBranchName,
        envId: this.env,
        lastCommit: lastCommit,
        getRepo: this.getRepo,
        getRepoNodes: this.getRepoNodes,
        getErrors: this.getErrors,
        debug: this.debug
      };
    } else {
      syncRepoReqPayload = {
        direction: 'to-server',
        projectId: this.projectId,
        repoId: repoId,
        branchId: currentBranchName,
        envId: this.env,
        lastCommit: lastCommit,
        changedFiles: changedFiles,
        deletedFiles: deletedFiles,
        getRepo: this.getRepo,
        getRepoNodes: this.getRepoNodes,
        getErrors: this.getErrors,
        debug: this.debug
      };
    }

    let syncRepoOutput: ToBackendSyncRepoOutput = await mreq({
      apiKey: this.context.config.mproveCliApiKey,
      route: 'api/ToBackendSyncRepo',
      payload: syncRepoReqPayload,
      host: this.context.config.mproveCliHost
    });

    let appliedChangesOnLocal: string[] = [];
    let appliedChangesOnServer: string[] = [];

    if (syncRepoOutput.direction === 'from-server') {
      appliedChangesOnLocal = await Result.unwrap(
        Result.pipe(
          getSyncAppliedChanges({
            repoDir: repoDir,
            changedFiles: syncRepoOutput.changedFiles,
            deletedFiles: syncRepoOutput.deletedFiles,
            statusResult: statusResult
          }),
          Result.mapError(
            error =>
              new ServerError({
                message: error.code,
                displayData:
                  'displayData' in error ? error.displayData : undefined
              })
          )
        )
      );

      await Result.unwrap(
        Result.pipe(
          resetWorkingTreeToHead({
            repoDir: repoDir,
            statusResult: statusResult
          }),
          Result.mapError(
            error =>
              new ServerError({
                message: error.code,
                displayData: error.displayData
              })
          )
        )
      );

      await Result.unwrap(
        Result.pipe(
          applySyncPayload({
            repoDir: repoDir,
            changedFiles: syncRepoOutput.changedFiles,
            deletedFiles: syncRepoOutput.deletedFiles
          }),
          Result.mapError(
            error =>
              new ServerError({
                message: error.code,
                displayData:
                  'displayData' in error ? error.displayData : undefined
              })
          )
        )
      );
    } else {
      appliedChangesOnServer = syncRepoOutput.appliedChangesOnServer;
    }

    //

    let localChangesToCommit = await Result.unwrap(
      Result.pipe(
        getChangesToCommit({
          repoDir: repoDir,
          addContent: true,
          expandRenamed: true
        }),
        Result.mapError(error => new ServerError({ message: error.code }))
      )
    );

    let devChangesToCommit = syncRepoOutput.devChangesToCommit;
    let syncSuccess = deepEqual(localChangesToCommit, devChangesToCommit);

    if (syncSuccess === false) {
      logToConsoleMcli({
        log: {
          localChangesToCommit: localChangesToCommit,
          devChangesToCommit: devChangesToCommit
        },
        logLevel: 'Info',
        context: this.context,
        isJson: this.json
      });

      let serverError = new ServerError({
        message: 'MCLI_SYNC_FAILED'
      });
      throw serverError;
    }

    let builderUrl = getBuilderUrl({
      host: this.context.config.mproveCliHost,
      orgId: syncRepoOutput.orgId,
      projectId: this.projectId,
      repoId: syncRepoOutput.repoId,
      branch: currentBranchName,
      env: this.env
    });

    let log: any = {
      message: `Sync completed`,
      appliedChangesOnLocal: appliedChangesOnLocal,
      appliedChangesOnServer: appliedChangesOnServer,
      validationErrorsTotal: syncRepoOutput.validationErrorsTotal
    };

    if (this.getRepo === true) {
      let repo = syncRepoOutput.repo;

      log.repo = repo;
    }

    if (this.getErrors === true) {
      log.validationErrors = mapBmlErrorsToMproveValidationErrors({
        errors: syncRepoOutput.validationErrors ?? []
      });
    }

    if (this.debug === true) {
      log.debug = {
        fromServer: this.fromServer,
        changedFiles: changedFiles,
        deletedFiles: deletedFiles,
        responseChangedFiles:
          syncRepoOutput.direction === 'from-server'
            ? syncRepoOutput.changedFiles
            : [],
        responseDeletedFiles:
          syncRepoOutput.direction === 'from-server'
            ? syncRepoOutput.deletedFiles
            : [],
        localChangesToCommit: localChangesToCommit,
        devChangesToCommit: devChangesToCommit,
        needValidate: syncRepoOutput.needValidate,
        structId: syncRepoOutput.structId
      };
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
