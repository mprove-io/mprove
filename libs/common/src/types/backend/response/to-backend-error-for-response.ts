import type { ToBackendResponse } from '#common/types/backend/response/to-backend-response';

export type ToBackendErrorForResponse<TResponse extends ToBackendResponse> =
  Extract<TResponse, { type: 'Failure' }>['error'];
