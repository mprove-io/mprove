import type { ToBackendGetConnectionSampleResponse } from '#common/types/backend/routes/connections/get-connection-sample/get-connection-sample-response';
import type { McliProjectIdIsNotDefinedError } from '#mcli/types/errors/mcli-project-id-is-not-defined-error';
import type { MreqError } from '#mcli/types/function-errors/mreq-error';

export type GetSampleCommandError =
  | MreqError<ToBackendGetConnectionSampleResponse>
  | McliProjectIdIsNotDefinedError;
