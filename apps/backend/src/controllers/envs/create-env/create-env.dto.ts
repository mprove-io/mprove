import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendCreateEnvRequest,
  zToBackendCreateEnvResponse
} from '#common/zod/to-backend/envs/to-backend-create-env';

export class ToBackendCreateEnvRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendCreateEnvRequest })
) {}

export class ToBackendCreateEnvResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendCreateEnvResponse })
) {}
