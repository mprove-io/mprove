import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendGetEnvsRequest,
  zToBackendGetEnvsResponse
} from '#common/zod/to-backend/envs/to-backend-get-envs';

export class ToBackendGetEnvsRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetEnvsRequest })
) {}

export class ToBackendGetEnvsResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetEnvsResponse })
) {}
