import { Result } from '@praha/byethrow';
import type { z } from 'zod';
import { getToBackendOperation } from '#backend/functions/top/get-to-backend-operation/get-to-backend-operation';
import { makeBackendInvalidRequestError } from '#backend/functions/top/make-backend-invalid-request-error/make-backend-invalid-request-error';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { BackendInvalidRequestError } from '#common/types/backend/errors/backend-invalid-request-error';
import type { ValidateToBackendRequestError } from '#common/types/backend/function-errors/validate-to-backend-request-error';
import type { ToBackendOperation } from '#common/types/backend/request/to-backend-operation';
import { zToBackendOperationRegistry } from '#common/types/backend/request/to-backend-operation-registry';
import type { ToBackendRequest } from '#common/types/backend/request/to-backend-request';

export function validateToBackendRequestResult(item: {
  path: string;
  body: unknown;
}): Result.Result<ToBackendRequest, ValidateToBackendRequestError> {
  let { path, body } = item;

  let operation: ToBackendOperation = getToBackendOperation({ path: path });

  if (isUndefined(operation)) {
    return Result.fail({
      code: 'BACKEND_INVALID_REQUEST',
      displayData: []
    });
  }

  let validation: z.ZodSafeParseResult<ToBackendRequest> =
    zToBackendOperationRegistry[operation].request.safeParse(body);

  if (validation.success === false) {
    let error: BackendInvalidRequestError = makeBackendInvalidRequestError({
      issues: validation.error.issues
    });

    return Result.fail(error);
  }

  let request: ToBackendRequest = validation.data;

  return Result.succeed(request);
}
