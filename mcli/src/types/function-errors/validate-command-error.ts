import type { ToBackendValidateFilesResponse } from '#common/types/backend/routes/files/validate-files/validate-files-response';
import type { McliProjectIdIsNotDefinedError } from '#mcli/types/errors/mcli-project-id-is-not-defined-error';
import type { GetApiKeyRepoIdError } from '#mcli/types/function-errors/get-api-key-repo-id-error';
import type { MreqError } from '#mcli/types/function-errors/mreq-error';

export type ValidateCommandError =
  | GetApiKeyRepoIdError
  | MreqError<ToBackendValidateFilesResponse>
  | McliProjectIdIsNotDefinedError;
