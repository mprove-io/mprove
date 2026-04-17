import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendDeleteUserRequest,
  zToBackendDeleteUserResponse
} from '#common/zod/to-backend/users/to-backend-delete-user';

export class ToBackendDeleteUserRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDeleteUserRequest })
) {}

export class ToBackendDeleteUserResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDeleteUserResponse })
) {}
