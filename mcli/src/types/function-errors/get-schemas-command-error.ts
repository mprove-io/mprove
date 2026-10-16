import type { ToBackendGetConnectionSchemasResponse } from '#common/types/backend/routes/connections/get-connection-schemas/get-connection-schemas-response';
import type { McliProjectIdIsNotDefinedError } from '#mcli/types/errors/mcli-project-id-is-not-defined-error';
import type { GetApiKeyRepoIdError } from '#mcli/types/function-errors/get-api-key-repo-id-error';
import type { MreqError } from '#mcli/types/function-errors/mreq-error';

export type GetSchemasCommandError =
  | GetApiKeyRepoIdError
  | MreqError<ToBackendGetConnectionSchemasResponse>
  | McliProjectIdIsNotDefinedError;
