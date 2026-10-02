import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendConfirmUserEmailRequest } from '#common/types/backend/routes/users/confirm-user-email/confirm-user-email-request';
import { zToBackendConfirmUserEmailResponse } from '#common/types/backend/routes/users/confirm-user-email/confirm-user-email-response';

export class ToBackendConfirmUserEmailRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendConfirmUserEmailRequest })
) {}

export class ToBackendConfirmUserEmailResponseDto extends createBackendResponseDto(
  { schema: zToBackendConfirmUserEmailResponse }
) {}
