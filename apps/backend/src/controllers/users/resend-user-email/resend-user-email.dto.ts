import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/top/create-backend-response-dto/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod/zod-strip-custom/zod-strip-custom';
import { zToBackendResendUserEmailRequest } from '#common/types/backend/routes/users/resend-user-email/resend-user-email-request';
import { zToBackendResendUserEmailResponse } from '#common/types/backend/routes/users/resend-user-email/resend-user-email-response';

export class ToBackendResendUserEmailRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendResendUserEmailRequest })
) {}

export class ToBackendResendUserEmailResponseDto extends createBackendResponseDto(
  { schema: zToBackendResendUserEmailResponse }
) {}
