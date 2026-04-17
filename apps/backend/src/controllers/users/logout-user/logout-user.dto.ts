import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendLogoutUserRequest,
  zToBackendLogoutUserResponse
} from '#common/zod/to-backend/users/to-backend-logout-user';

export class ToBackendLogoutUserRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendLogoutUserRequest })
) {}

export class ToBackendLogoutUserResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendLogoutUserResponse })
) {}
