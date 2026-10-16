import type { ToBackendGetConnectionsListResponse } from '#common/types/backend/routes/connections/get-connections-list/get-connections-list-response';
import type { McliProjectIdIsNotDefinedError } from '#mcli/types/errors/mcli-project-id-is-not-defined-error';
import type { MreqError } from '#mcli/types/function-errors/mreq-error';

export type GetConnectionsListCommandError =
  | MreqError<ToBackendGetConnectionsListResponse>
  | McliProjectIdIsNotDefinedError;
