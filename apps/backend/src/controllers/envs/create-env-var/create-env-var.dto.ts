import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendCreateEnvVarRequest } from '#common/zod/backend/routes/envs/create-env-var/create-env-var-request';
import { zToBackendCreateEnvVarResponse } from '#common/zod/backend/routes/envs/create-env-var/create-env-var-response';

export class ToBackendCreateEnvVarRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendCreateEnvVarRequest })
) {}

export class ToBackendCreateEnvVarResponseDto extends createBackendResponseDto({
  schema: zToBackendCreateEnvVarResponse
}) {}
