import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendEditEnvVarRequest,
  zToBackendEditEnvVarResponse
} from '#common/zod/to-backend/envs/to-backend-edit-env-var';

export class ToBackendEditEnvVarRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendEditEnvVarRequest })
) {}

export class ToBackendEditEnvVarResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendEditEnvVarResponse })
) {}
