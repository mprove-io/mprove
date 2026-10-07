import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/top/create-backend-response-dto/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod/zod-strip-custom/zod-strip-custom';
import { zToBackendCreateEnvUserRequest } from '#common/types/backend/routes/envs/create-env-user/create-env-user-request';
import { zToBackendCreateEnvUserResponse } from '#common/types/backend/routes/envs/create-env-user/create-env-user-response';

export class ToBackendCreateEnvUserRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendCreateEnvUserRequest })
) {}

export class ToBackendCreateEnvUserResponseDto extends createBackendResponseDto(
  { schema: zToBackendCreateEnvUserResponse }
) {}
