import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendCreateEnvUserRequest,
  zToBackendCreateEnvUserResponse
} from '#common/zod/to-backend/envs/to-backend-create-env-user';

export class ToBackendCreateEnvUserRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendCreateEnvUserRequest })
) {}

export class ToBackendCreateEnvUserResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendCreateEnvUserResponse })
) {}
