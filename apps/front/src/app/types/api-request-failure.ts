import type { ToBackendOperation } from '#common/types/backend/request/to-backend-operation';
import type { ToBackendErrorForResponse } from '#common/types/backend/response/to-backend-error-for-response';
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

export type ApiRequestFailure<TResponse extends ToBackendResponse> =
  | {
      type: 'backend';
      response: Extract<TResponse, { type: 'Failure' }> & {
        error: ToBackendErrorForResponse<TResponse>;
      };
      context: ApiRequestContext;
    }
  | {
      type: 'transport';
      error: ApiTransportError;
      context: ApiRequestContext;
    }
  | {
      type: 'invalid-response';
      error: ApiInvalidResponseError;
      context: ApiRequestContext;
    };
