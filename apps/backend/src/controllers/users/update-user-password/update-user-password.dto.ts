import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/top/create-backend-response-dto/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod/zod-strip-custom/zod-strip-custom';
import { zToBackendUpdateUserPasswordRequest } from '#common/types/backend/routes/users/update-user-password/update-user-password-request';
import { zToBackendUpdateUserPasswordResponse } from '#common/types/backend/routes/users/update-user-password/update-user-password-response';

export class ToBackendUpdateUserPasswordRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendUpdateUserPasswordRequest })
) {}

export class ToBackendUpdateUserPasswordResponseDto extends createBackendResponseDto(
  { schema: zToBackendUpdateUserPasswordResponse }
) {}
