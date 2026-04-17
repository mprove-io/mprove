import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendCreateEnvVarRequest,
  zToBackendCreateEnvVarResponse
} from '#common/zod/to-backend/envs/to-backend-create-env-var';

export class ToBackendCreateEnvVarRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendCreateEnvVarRequest })
) {}

export class ToBackendCreateEnvVarResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendCreateEnvVarResponse })
) {}
