import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendDeleteEnvUserRequest,
  zToBackendDeleteEnvUserResponse
} from '#common/zod/to-backend/envs/to-backend-delete-env-user';

export class ToBackendDeleteEnvUserRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDeleteEnvUserRequest })
) {}

export class ToBackendDeleteEnvUserResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDeleteEnvUserResponse })
) {}
