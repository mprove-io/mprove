import type { z } from 'zod';
import type { BackendInvalidRequestError } from '#common/types/backend/errors/backend-invalid-request-error';

export function makeBackendInvalidRequestError(item: {
  issues: z.ZodError['issues'];
}): BackendInvalidRequestError {
  let { issues } = item;

  let displayData: BackendInvalidRequestError['displayData'] = issues.map(
    issue => ({
      path: issue.path.join('.'),
      message: issue.message,
      code: issue.code
    })
  );

  let error: BackendInvalidRequestError = {
    code: 'BACKEND_INVALID_REQUEST',
    displayData: displayData
  };

  return error;
}
