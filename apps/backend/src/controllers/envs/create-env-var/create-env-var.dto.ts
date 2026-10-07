import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/top/create-backend-response-dto/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod/zod-strip-custom/zod-strip-custom';
import { zToBackendCreateEnvVarRequest } from '#common/types/backend/routes/envs/create-env-var/create-env-var-request';
import { zToBackendCreateEnvVarResponse } from '#common/types/backend/routes/envs/create-env-var/create-env-var-response';

export class ToBackendCreateEnvVarRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendCreateEnvVarRequest })
) {}

export class ToBackendCreateEnvVarResponseDto extends createBackendResponseDto({
  schema: zToBackendCreateEnvVarResponse
}) {}
