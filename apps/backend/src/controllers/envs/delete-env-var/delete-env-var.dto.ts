import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendDeleteEnvVarRequest,
  zToBackendDeleteEnvVarResponse
} from '#common/zod/to-backend/envs/to-backend-delete-env-var';

export class ToBackendDeleteEnvVarRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDeleteEnvVarRequest })
) {}

export class ToBackendDeleteEnvVarResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDeleteEnvVarResponse })
) {}
