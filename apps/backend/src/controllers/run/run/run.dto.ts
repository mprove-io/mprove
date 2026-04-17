import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendRunRequest,
  zToBackendRunResponse
} from '#common/zod/to-backend/run/to-backend-run';

export class ToBackendRunRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendRunRequest })
) {}

export class ToBackendRunResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendRunResponse })
) {}
