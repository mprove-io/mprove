import type { ToBackendRunResponse } from '#common/types/backend/routes/run/run/run-response';
import type { McliProjectIdIsNotDefinedError } from '#mcli/types/errors/mcli-project-id-is-not-defined-error';
import type { GetApiKeyRepoIdError } from '#mcli/types/function-errors/get-api-key-repo-id-error';
import type { MreqError } from '#mcli/types/function-errors/mreq-error';

export type RunCommandError =
  | GetApiKeyRepoIdError
  | MreqError<ToBackendRunResponse>
  | McliProjectIdIsNotDefinedError;
