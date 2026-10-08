import { createZodValidationPipe } from 'nestjs-zod';
import type { z } from 'zod';
import { ServerError } from '#common/classes/server-error/server-error';
import type { BackendInvalidRequestError } from '#common/types/backend/errors/backend-invalid-request-error';

export const ZodValidationPipe = createZodValidationPipe({
  createValidationException: (error: unknown) => {
    let zodError: z.ZodError = error as z.ZodError;

    let constraints: BackendInvalidRequestError['displayData'] =
      zodError.issues.map(issue => ({
        path: issue.path.join('.'),
        message: issue.message,
        code: issue.code
      }));

    let exception: ServerError = new ServerError({
      message: 'BACKEND_INVALID_REQUEST',
      displayData: constraints,
      originalError: error
    });

    return exception;
  }
});
