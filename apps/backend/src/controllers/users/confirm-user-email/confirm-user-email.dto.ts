import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendConfirmUserEmailRequest } from '#common/zod/backend/routes/users/confirm-user-email/confirm-user-email-request';
import { zToBackendConfirmUserEmailResponse } from '#common/zod/backend/routes/users/confirm-user-email/confirm-user-email-response';

export class ToBackendConfirmUserEmailRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendConfirmUserEmailRequest })
) {}

export class ToBackendConfirmUserEmailResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendConfirmUserEmailResponse })
) {}
