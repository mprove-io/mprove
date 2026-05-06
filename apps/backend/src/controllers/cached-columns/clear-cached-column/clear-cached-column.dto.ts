import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendClearCachedColumnRequest,
  zToBackendClearCachedColumnResponse
} from '#common/zod/to-backend/connections/to-backend-clear-cached-column';

export class ToBackendClearCachedColumnRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendClearCachedColumnRequest })
) {}

export class ToBackendClearCachedColumnResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendClearCachedColumnResponse })
) {}
