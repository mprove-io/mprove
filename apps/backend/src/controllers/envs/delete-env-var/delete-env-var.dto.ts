import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/top/create-backend-response-dto/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod/zod-strip-custom/zod-strip-custom';
import { zToBackendDeleteEnvVarRequest } from '#common/types/backend/routes/envs/delete-env-var/delete-env-var-request';
import { zToBackendDeleteEnvVarResponse } from '#common/types/backend/routes/envs/delete-env-var/delete-env-var-response';

export class ToBackendDeleteEnvVarRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDeleteEnvVarRequest })
) {}

export class ToBackendDeleteEnvVarResponseDto extends createBackendResponseDto({
  schema: zToBackendDeleteEnvVarResponse
}) {}
