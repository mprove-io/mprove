import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendResetUserPasswordRequest } from '#common/zod/backend/routes/users/reset-user-password/reset-user-password-request';
import { zToBackendResetUserPasswordResponse } from '#common/zod/backend/routes/users/reset-user-password/reset-user-password-response';

export class ToBackendResetUserPasswordRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendResetUserPasswordRequest })
) {}

export class ToBackendResetUserPasswordResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendResetUserPasswordResponse })
) {}
