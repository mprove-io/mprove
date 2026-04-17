import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendConfirmUserEmailRequest,
  zToBackendConfirmUserEmailResponse
} from '#common/zod/to-backend/users/to-backend-confirm-user-email';

export class ToBackendConfirmUserEmailRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendConfirmUserEmailRequest })
) {}

export class ToBackendConfirmUserEmailResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendConfirmUserEmailResponse })
) {}
