import { Result } from '@praha/byethrow';
import { Command, Option } from 'clipanion';
import deepEqual from 'fast-deep-equal';
import { getBuilderUrl } from '#common/functions/get-builder-url/get-builder-url';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import { mapBmlErrorsToMproveValidationErrors } from '#common/functions/map-bml-errors-to-mprove-validation-errors/map-bml-errors-to-mprove-validation-errors';
import type { ToBackendSyncRepoOutput } from '#common/types/backend/routes/repos/sync-repo/sync-repo-output';
import type { ToBackendSyncRepoRequest } from '#common/types/backend/routes/repos/sync-repo/sync-repo-request';
import type { ToBackendSyncRepoResponse } from '#common/types/backend/routes/repos/sync-repo/sync-repo-response';
import type { DiskFileChange } from '#common/types/disk/parts/file/disk-file-change';
import type { ApplySyncPayloadError } from '#common/types/node-common/function-errors/apply-sync-payload-error';
import type { GetChangesToCommitError } from '#common/types/node-common/function-errors/get-changes-to-commit-error';
import type { GetSyncAppliedChangesError } from '#common/types/node-common/function-errors/get-sync-applied-changes-error';
import type { GetSyncFilesPayloadError } from '#common/types/node-common/function-errors/get-sync-files-payload-error';
import type { ResetWorkingTreeToHeadError } from '#common/types/node-common/function-errors/reset-working-tree-to-head-error';
import { CustomCommand } from '#mcli/classes/custom-command/custom-command';
import { getApiKeyRepoId } from '#mcli/functions/get-api-key-repo-id/get-api-key-repo-id';
import { mreq } from '#mcli/functions/mreq/mreq';
import { logToConsoleMcli } from '#mcli/functions/top/log-to-console-mcli/log-to-console-mcli';
import type { McliSyncChangesMismatchError } from '#mcli/types/errors/mcli-sync-changes-mismatch-error';
import type { GetApiKeyRepoIdError } from '#mcli/types/function-errors/get-api-key-repo-id-error';
import type { MreqError } from '#mcli/types/function-errors/mreq-error';
import type { SyncCommandError } from '#mcli/types/function-errors/sync-command-error';
import { applySyncPayload } from '#node-common/functions/apply-sync-payload/apply-sync-payload';
import { createSimpleGit } from '#node-common/functions/create-simple-git/create-simple-git';
import { getChangesToCommit } from '#node-common/functions/get-changes-to-commit/get-changes-to-commit';
import { getSyncAppliedChanges } from '#node-common/functions/get-sync-applied-changes/get-sync-applied-changes';
import {
  getSyncFilesPayload,
  type SyncFilesPayload
} from '#node-common/functions/get-sync-files-payload/get-sync-files-payload';
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

  override async act(): Result.ResultAsync<void, SyncCommandError> {
    this.projectId = this.projectId || this.context.config.mproveCliProjectId;

    if (isUndefined(this.projectId)) {
      return Result.fail({ code: 'MCLI_PROJECT_ID_IS_NOT_DEFINED' });
    }

    let repoDir = isDefined(this.localPath) ? this.localPath : process.cwd();

    let git = createSimpleGit({ baseDir: repoDir });

    let branchSummary = await git.branch();

    let currentBranchName = branchSummary.current;

    let logResult = await git.log(['-1']);

    let lastCommit = logResult.latest?.hash;

    let statusResult = await git.status();

    let localPayloadResult: Result.Result<
      SyncFilesPayload,
      GetSyncFilesPayloadError
    > =
      this.fromServer === true
        ? Result.succeed({ changedFiles: [], deletedFiles: [] })
        : await getSyncFilesPayload({
            repoDir: repoDir,
            statusResult: statusResult
          });

    if (Result.isFailure(localPayloadResult)) {
      return localPayloadResult;
    }

    let localPayload: SyncFilesPayload = localPayloadResult.value;

    let changedFiles = localPayload.changedFiles;
    let deletedFiles = localPayload.deletedFiles;

    let apiKey = this.context.config.mproveCliApiKey;

    let repoIdResult: Result.Result<string, GetApiKeyRepoIdError> =
      getApiKeyRepoId({ apiKey: apiKey });

    if (Result.isFailure(repoIdResult)) {
      return repoIdResult;
    }

    let repoId: string = repoIdResult.value;

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

    let syncRepoOutputResult: Result.Result<
      ToBackendSyncRepoOutput,
      MreqError<ToBackendSyncRepoResponse>
    > = await mreq({
      apiKey: this.context.config.mproveCliApiKey,
      route: 'api/ToBackendSyncRepo',
      payload: syncRepoReqPayload,
      host: this.context.config.mproveCliHost
    });

    if (Result.isFailure(syncRepoOutputResult)) {
      return syncRepoOutputResult;
    }

    let syncRepoOutput: ToBackendSyncRepoOutput = syncRepoOutputResult.value;

    let appliedChangesOnLocal: string[] = [];
    let appliedChangesOnServer: string[] = [];

    if (syncRepoOutput.direction === 'from-server') {
      let appliedChanges: Result.Result<string[], GetSyncAppliedChangesError> =
        await getSyncAppliedChanges({
          repoDir: repoDir,
          changedFiles: syncRepoOutput.changedFiles,
          deletedFiles: syncRepoOutput.deletedFiles,
          statusResult: statusResult
        });

      if (Result.isFailure(appliedChanges)) {
        return appliedChanges;
      }

      appliedChangesOnLocal = appliedChanges.value;

      let resetWorkingTree: Result.Result<void, ResetWorkingTreeToHeadError> =
        await resetWorkingTreeToHead({
          repoDir: repoDir,
          statusResult: statusResult
        });

      if (Result.isFailure(resetWorkingTree)) {
        return resetWorkingTree;
      }

      let applySync: Result.Result<void, ApplySyncPayloadError> =
        await applySyncPayload({
          repoDir: repoDir,
          changedFiles: syncRepoOutput.changedFiles,
          deletedFiles: syncRepoOutput.deletedFiles
        });

      if (Result.isFailure(applySync)) {
        return applySync;
      }
    } else {
      appliedChangesOnServer = syncRepoOutput.appliedChangesOnServer;
    }

    //

    let changesToCommit: Result.Result<
      DiskFileChange[],
      GetChangesToCommitError
    > = await getChangesToCommit({
      repoDir: repoDir,
      addContent: true,
      expandRenamed: true
    });

    if (Result.isFailure(changesToCommit)) {
      return changesToCommit;
    }

    let localChangesToCommit: DiskFileChange[] = changesToCommit.value;

    let devChangesToCommit = syncRepoOutput.devChangesToCommit;
    let syncSuccess = deepEqual(localChangesToCommit, devChangesToCommit);

    if (syncSuccess === false) {
      return Result.fail<McliSyncChangesMismatchError>({
        code: 'MCLI_SYNC_CHANGES_MISMATCH',
        displayData: {
          localChangesToCommit: localChangesToCommit,
          devChangesToCommit: devChangesToCommit
        }
      });
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
      log.syncRepo = syncRepoOutput.syncRepo;
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

    return Result.succeed();
  }
}
