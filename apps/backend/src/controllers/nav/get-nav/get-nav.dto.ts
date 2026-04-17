import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendGetNavRequest,
  zToBackendGetNavResponse
} from '#common/zod/to-backend/nav/to-backend-get-nav';

export class ToBackendGetNavRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetNavRequest })
) {}

export class ToBackendGetNavResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetNavResponse })
) {}
