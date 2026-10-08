import type { z } from 'zod';
import { getToBackendOperation } from '#backend/functions/top/get-to-backend-operation/get-to-backend-operation';
import { ServerError } from '#common/classes/server-error/server-error';

import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { ToBackendOperation } from '#common/types/backend/request/to-backend-operation';
import { zToBackendOperationRegistry } from '#common/types/backend/request/to-backend-operation-registry';
import type { ToBackendRequest } from '#common/types/backend/request/to-backend-request';

export function validateToBackendRequest(item: {
  path: string;
  body: unknown;
}): ToBackendRequest {
  let { path, body } = item;

  let operation: ToBackendOperation = getToBackendOperation({ path: path });

  if (isUndefined(operation)) {
    throw new ServerError({
      message: 'BACKEND_INVALID_REQUEST',
      displayData: []
    });
  }

  let validation: z.ZodSafeParseResult<ToBackendRequest> =
    zToBackendOperationRegistry[operation].request.safeParse(body);

  if (validation.success === false) {
    throw new ServerError({
      message: 'BACKEND_INVALID_REQUEST',
      displayData: validation.error.issues.map(issue => ({
        path: issue.path.join('.'),
        message: issue.message,
        code: issue.code
      }))
    });
  }

  let request: ToBackendRequest = validation.data;

  return request;
}
