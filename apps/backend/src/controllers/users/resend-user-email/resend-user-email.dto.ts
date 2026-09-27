import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendResendUserEmailRequest } from '#common/zod/backend/routes/users/resend-user-email/resend-user-email-request';
import { zToBackendResendUserEmailResponse } from '#common/zod/backend/routes/users/resend-user-email/resend-user-email-response';

export class ToBackendResendUserEmailRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendResendUserEmailRequest })
) {}

export class ToBackendResendUserEmailResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendResendUserEmailResponse })
) {}
