import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendDeleteEnvVarRequest } from '#common/zod/backend/routes/envs/delete-env-var/delete-env-var-request';
import { zToBackendDeleteEnvVarResponse } from '#common/zod/backend/routes/envs/delete-env-var/delete-env-var-response';

export class ToBackendDeleteEnvVarRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDeleteEnvVarRequest })
) {}

export class ToBackendDeleteEnvVarResponseDto extends createBackendResponseDto({
  schema: zToBackendDeleteEnvVarResponse
}) {}
