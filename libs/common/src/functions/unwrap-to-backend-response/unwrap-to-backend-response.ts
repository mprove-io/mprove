import { ServerError } from '#common/classes/server-error/server-error';
import type { ToBackendResponse } from '#common/zod/backend/response/to-backend-response';

export function unwrapToBackendResponse<TOutput>(item: {
  response: ToBackendResponse<TOutput>;
}): TOutput {
  let { response } = item;

  if (response.result.type === 'Failure') {
    throw new ServerError(response.result.error);
  }

  let output: TOutput = response.result.value;

  return output;
}
