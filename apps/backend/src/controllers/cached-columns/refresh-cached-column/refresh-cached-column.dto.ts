import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendRefreshCachedColumnRequest,
  zToBackendRefreshCachedColumnResponse
} from '#common/zod/to-backend/connections/to-backend-refresh-cached-column';

export class ToBackendRefreshCachedColumnRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendRefreshCachedColumnRequest })
) {}

export class ToBackendRefreshCachedColumnResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendRefreshCachedColumnResponse })
) {}
