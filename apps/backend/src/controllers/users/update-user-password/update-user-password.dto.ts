import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendUpdateUserPasswordRequest } from '#common/zod/backend/routes/users/update-user-password/update-user-password-request';
import { zToBackendUpdateUserPasswordResponse } from '#common/zod/backend/routes/users/update-user-password/update-user-password-response';

export class ToBackendUpdateUserPasswordRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendUpdateUserPasswordRequest })
) {}

export class ToBackendUpdateUserPasswordResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendUpdateUserPasswordResponse })
) {}
