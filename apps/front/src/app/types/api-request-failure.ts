import type { ToBackendOperation } from '#common/types/backend/request/to-backend-operation';
import type { ToBackendResponse } from '#common/types/backend/response/to-backend-response';

export type ApiRequestContext = {
  url: string;
  operation: ToBackendOperation;
  traceId: string;
  status?: number;
  response?: unknown;
};

export type ApiTransportError =
  | { code: 'FRONT_REQUEST_FAILED' }
  | { code: 'FRONT_REQUEST_TIMEOUT' };

export type ApiInvalidResponseError = {
  code: 'FRONT_INVALID_BACKEND_RESPONSE';
};

export type ApiTransportFailure = {
  type: 'Failure';
  error: ApiTransportError;
  context: ApiRequestContext;
};

export type ApiInvalidResponse = {
  type: 'Failure';
  error: ApiInvalidResponseError;
  context: ApiRequestContext;
};

export type ApiRequestFailure<TResponse extends ToBackendResponse> =
  | Extract<TResponse, { type: 'Failure' }>
  | ApiTransportFailure
  | ApiInvalidResponse;
