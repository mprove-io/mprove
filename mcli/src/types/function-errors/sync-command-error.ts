import type { ToBackendSyncRepoResponse } from '#common/types/backend/routes/repos/sync-repo/sync-repo-response';
import type { ApplySyncPayloadError } from '#common/types/node-common/function-errors/apply-sync-payload-error';
import type { GetChangesToCommitError } from '#common/types/node-common/function-errors/get-changes-to-commit-error';
import type { GetSyncAppliedChangesError } from '#common/types/node-common/function-errors/get-sync-applied-changes-error';
import type { GetSyncFilesPayloadError } from '#common/types/node-common/function-errors/get-sync-files-payload-error';
import type { ResetWorkingTreeToHeadError } from '#common/types/node-common/function-errors/reset-working-tree-to-head-error';
import type { McliProjectIdIsNotDefinedError } from '#mcli/types/errors/mcli-project-id-is-not-defined-error';
import type { McliSyncChangesMismatchError } from '#mcli/types/errors/mcli-sync-changes-mismatch-error';
import type { GetApiKeyRepoIdError } from '#mcli/types/function-errors/get-api-key-repo-id-error';
import type { MreqError } from '#mcli/types/function-errors/mreq-error';

export type SyncCommandError =
  | GetApiKeyRepoIdError
  | McliProjectIdIsNotDefinedError
  | GetSyncFilesPayloadError
  | GetSyncAppliedChangesError
  | ResetWorkingTreeToHeadError
  | ApplySyncPayloadError
  | GetChangesToCommitError
  | MreqError<ToBackendSyncRepoResponse>
  | McliSyncChangesMismatchError;
