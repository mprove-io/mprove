import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendRegisterUserRequest,
  zToBackendRegisterUserResponse
} from '#common/zod/to-backend/users/to-backend-register-user';

export class ToBackendRegisterUserRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendRegisterUserRequest })
) {}

export class ToBackendRegisterUserResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendRegisterUserResponse })
) {}
