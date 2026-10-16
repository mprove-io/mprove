import { BackendResponseError } from '#common/classes/backend-response-error/backend-response-error';
import type { BackendError } from '#common/types/backend/errors/backend-error';
import type { ToBackendResponse } from '#common/types/backend/response/to-backend-response';
import type { ToBackendResponseBase } from '#common/types/backend/response/to-backend-response-base';

export function unwrapBackendResponseOutput<
  TResponse extends ToBackendResponse
>(item: {
  response: TResponse;
}): Extract<TResponse, { type: 'Success' }>['output'];

export function unwrapBackendResponseOutput<TOutput>(item: {
  response: ToBackendResponseBase<string, TOutput, BackendError>;
}): TOutput;

export function unwrapBackendResponseOutput(item: {
  response: ToBackendResponseBase<string, unknown, BackendError>;
}): unknown {
  let { response } = item;

  if (response.type === 'Failure') {
    throw new BackendResponseError({ response: response });
  }

  let output: unknown = response.output;

  return output;
}
