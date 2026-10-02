import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendEditEnvVarRequest } from '#common/types/backend/routes/envs/edit-env-var/edit-env-var-request';
import { zToBackendEditEnvVarResponse } from '#common/types/backend/routes/envs/edit-env-var/edit-env-var-response';

export class ToBackendEditEnvVarRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendEditEnvVarRequest })
) {}

export class ToBackendEditEnvVarResponseDto extends createBackendResponseDto({
  schema: zToBackendEditEnvVarResponse
}) {}
