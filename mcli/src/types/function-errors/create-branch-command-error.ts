import type { ToBackendCreateBranchResponse } from '#common/types/backend/routes/branches/create-branch/create-branch-response';
import type { McliProjectIdIsNotDefinedError } from '#mcli/types/errors/mcli-project-id-is-not-defined-error';
import type { GetApiKeyRepoIdError } from '#mcli/types/function-errors/get-api-key-repo-id-error';
import type { MreqError } from '#mcli/types/function-errors/mreq-error';

export type CreateBranchCommandError =
  | GetApiKeyRepoIdError
  | MreqError<ToBackendCreateBranchResponse>
  | McliProjectIdIsNotDefinedError;
