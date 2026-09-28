import { ServerError } from '#common/classes/server-error/server-error';
import type { BackendError } from '#common/zod/backend/errors/backend-error';
import type { ToBackendResponseBase } from '#common/zod/backend/response/to-backend-response-base';

export function unwrapBackendResponseOutput<TOutput>(item: {
  response: ToBackendResponseBase<string, TOutput, BackendError>;
}): TOutput {
  let { response } = item;

  if (response.type === 'Failure') {
    throw new ServerError({
      message: response.error.code,
      displayData:
        'displayData' in response.error
          ? response.error.displayData
          : undefined,
      originalError:
        'originalError' in response.error
          ? response.error.originalError
          : undefined
    });
  }

  let output: TOutput = response.output;

  return output;
}
