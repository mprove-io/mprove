import type { ToBackendErrorForResponse } from '#common/types/backend/response/to-backend-error-for-response';
import type { ToBackendResponse } from '#common/types/backend/response/to-backend-response';
import type { McliInvalidBackendResponseError } from '#mcli/types/errors/mcli-invalid-backend-response-error';
import type { McliRequestFailedError } from '#mcli/types/errors/mcli-request-failed-error';

export type MreqError<TResponse extends ToBackendResponse> =
  | ToBackendErrorForResponse<TResponse>
  | McliRequestFailedError
  | McliInvalidBackendResponseError;
