import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/top/create-backend-response-dto/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod/zod-strip-custom/zod-strip-custom';
import { zToBackendDeleteEnvUserRequest } from '#common/types/backend/routes/envs/delete-env-user/delete-env-user-request';
import { zToBackendDeleteEnvUserResponse } from '#common/types/backend/routes/envs/delete-env-user/delete-env-user-response';

export class ToBackendDeleteEnvUserRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDeleteEnvUserRequest })
) {}

export class ToBackendDeleteEnvUserResponseDto extends createBackendResponseDto(
  { schema: zToBackendDeleteEnvUserResponse }
) {}
