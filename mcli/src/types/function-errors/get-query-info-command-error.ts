import type { ToBackendGetQueryInfoResponse } from '#common/types/backend/routes/query-info/get-query-info/get-query-info-response';
import type { McliProjectIdIsNotDefinedError } from '#mcli/types/errors/mcli-project-id-is-not-defined-error';
import type { GetApiKeyRepoIdError } from '#mcli/types/function-errors/get-api-key-repo-id-error';
import type { MreqError } from '#mcli/types/function-errors/mreq-error';

export type GetQueryInfoCommandError =
  | GetApiKeyRepoIdError
  | MreqError<ToBackendGetQueryInfoResponse>
  | McliProjectIdIsNotDefinedError;
