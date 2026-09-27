import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendEditEnvVarRequest } from '#common/zod/backend/routes/envs/edit-env-var/edit-env-var-request';
import { zToBackendEditEnvVarResponse } from '#common/zod/backend/routes/envs/edit-env-var/edit-env-var-response';

export class ToBackendEditEnvVarRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendEditEnvVarRequest })
) {}

export class ToBackendEditEnvVarResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendEditEnvVarResponse })
) {}
