import { createZodValidationPipe } from 'nestjs-zod';
import { ErEnum } from '#common/enums/er.enum';
import { ServerError } from '#common/models/server-error';

export const ZodValidationPipe = createZodValidationPipe({
  createValidationException: (error: unknown) =>
    new ServerError({
      message: ErEnum.BACKEND_WRONG_REQUEST_PARAMS,
      originalError: error
    })
});
