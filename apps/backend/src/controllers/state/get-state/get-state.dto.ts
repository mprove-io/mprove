import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendGetStateRequest,
  zToBackendGetStateResponse
} from '#common/zod/to-backend/state/to-backend-get-state';

export class ToBackendGetStateRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetStateRequest })
) {}

export class ToBackendGetStateResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetStateResponse })
) {}
