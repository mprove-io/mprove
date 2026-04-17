import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendDeleteEnvRequest,
  zToBackendDeleteEnvResponse
} from '#common/zod/to-backend/envs/to-backend-delete-env';

export class ToBackendDeleteEnvRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDeleteEnvRequest })
) {}

export class ToBackendDeleteEnvResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDeleteEnvResponse })
) {}
