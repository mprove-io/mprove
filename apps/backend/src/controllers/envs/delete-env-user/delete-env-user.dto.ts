import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendDeleteEnvUserRequest } from '#common/zod/backend/routes/envs/delete-env-user/delete-env-user-request';
import { zToBackendDeleteEnvUserResponse } from '#common/zod/backend/routes/envs/delete-env-user/delete-env-user-response';

export class ToBackendDeleteEnvUserRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDeleteEnvUserRequest })
) {}

export class ToBackendDeleteEnvUserResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDeleteEnvUserResponse })
) {}
