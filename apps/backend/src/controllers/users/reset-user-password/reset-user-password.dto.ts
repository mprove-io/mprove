import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendResetUserPasswordRequest } from '#common/types/backend/routes/users/reset-user-password/reset-user-password-request';
import { zToBackendResetUserPasswordResponse } from '#common/types/backend/routes/users/reset-user-password/reset-user-password-response';

export class ToBackendResetUserPasswordRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendResetUserPasswordRequest })
) {}

export class ToBackendResetUserPasswordResponseDto extends createBackendResponseDto(
  { schema: zToBackendResetUserPasswordResponse }
) {}
