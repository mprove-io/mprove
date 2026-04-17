import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendCheckLastNavRequest,
  zToBackendCheckLastNavResponse
} from '#common/zod/to-backend/nav/to-backend-check-last-nav';

export class ToBackendCheckLastNavRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendCheckLastNavRequest })
) {}

export class ToBackendCheckLastNavResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendCheckLastNavResponse })
) {}
