import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendCreateEnvUserRequest } from '#common/zod/backend/routes/envs/create-env-user/create-env-user-request';
import { zToBackendCreateEnvUserResponse } from '#common/zod/backend/routes/envs/create-env-user/create-env-user-response';

export class ToBackendCreateEnvUserRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendCreateEnvUserRequest })
) {}

export class ToBackendCreateEnvUserResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendCreateEnvUserResponse })
) {}
