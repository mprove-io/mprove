import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendResendUserEmailRequest,
  zToBackendResendUserEmailResponse
} from '#common/zod/to-backend/users/to-backend-resend-user-email';

export class ToBackendResendUserEmailRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendResendUserEmailRequest })
) {}

export class ToBackendResendUserEmailResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendResendUserEmailResponse })
) {}
