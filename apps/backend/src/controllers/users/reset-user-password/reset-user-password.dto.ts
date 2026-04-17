import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendResetUserPasswordRequest,
  zToBackendResetUserPasswordResponse
} from '#common/zod/to-backend/users/to-backend-reset-user-password';

export class ToBackendResetUserPasswordRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendResetUserPasswordRequest })
) {}

export class ToBackendResetUserPasswordResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendResetUserPasswordResponse })
) {}
