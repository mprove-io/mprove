import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendLoginUserRequest,
  zToBackendLoginUserResponse
} from '#common/zod/to-backend/users/to-backend-login-user';

export class ToBackendLoginUserRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendLoginUserRequest })
) {}

export class ToBackendLoginUserResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendLoginUserResponse })
) {}
