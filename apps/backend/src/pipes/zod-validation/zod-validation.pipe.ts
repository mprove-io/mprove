import { createZodValidationPipe } from 'nestjs-zod';
import type { z } from 'zod';
import { makeBackendInvalidRequestError } from '#backend/functions/top/make-backend-invalid-request-error/make-backend-invalid-request-error';
import { ServerError } from '#common/classes/server-error/server-error';
import type { BackendInvalidRequestError } from '#common/types/backend/errors/backend-invalid-request-error';

export const ZodValidationPipe = createZodValidationPipe({
  createValidationException: (error: unknown) => {
    let zodError: z.ZodError = error as z.ZodError;

    let invalidRequestError: BackendInvalidRequestError =
      makeBackendInvalidRequestError({ issues: zodError.issues });

    let exception: ServerError = new ServerError({
      message: invalidRequestError.code,
      displayData: invalidRequestError.displayData,
      originalError: error
    });

    return exception;
  }
});
