import { createZodValidationPipe } from 'nestjs-zod';
import type { z } from 'zod';
import { ServerError } from '#common/classes/server-error/server-error';

export const ZodValidationPipe = createZodValidationPipe({
  createValidationException: (error: unknown) => {
    let zodError = error as z.ZodError;
    let constraints = zodError.issues.map(issue => ({
      path: issue.path.join('.'),
      message: issue.message,
      code: issue.code
    }));
    return new ServerError({
      message: 'BACKEND_WRONG_REQUEST_PARAMS',
      displayData: constraints,
      originalError: error
    });
  }
});
