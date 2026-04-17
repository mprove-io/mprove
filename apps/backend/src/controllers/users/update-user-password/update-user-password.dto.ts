import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendUpdateUserPasswordRequest,
  zToBackendUpdateUserPasswordResponse
} from '#common/zod/to-backend/users/to-backend-update-user-password';

export class ToBackendUpdateUserPasswordRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendUpdateUserPasswordRequest })
) {}

export class ToBackendUpdateUserPasswordResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendUpdateUserPasswordResponse })
) {}
