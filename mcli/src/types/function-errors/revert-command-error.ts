import type { ToBackendRevertRepoToLastCommitResponse } from '#common/types/backend/routes/repos/revert-repo-to-last-commit/revert-repo-to-last-commit-response';
import type { ToBackendRevertRepoToRemoteResponse } from '#common/types/backend/routes/repos/revert-repo-to-remote/revert-repo-to-remote-response';
import type { McliProjectIdIsNotDefinedError } from '#mcli/types/errors/mcli-project-id-is-not-defined-error';
import type { GetApiKeyRepoIdError } from '#mcli/types/function-errors/get-api-key-repo-id-error';
import type { MreqError } from '#mcli/types/function-errors/mreq-error';

export type RevertCommandError =
  | GetApiKeyRepoIdError
  | MreqError<
      | ToBackendRevertRepoToLastCommitResponse
      | ToBackendRevertRepoToRemoteResponse
    >
  | McliProjectIdIsNotDefinedError;
