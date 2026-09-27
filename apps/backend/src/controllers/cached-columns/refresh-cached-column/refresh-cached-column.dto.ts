import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendRefreshCachedColumnRequest } from '#common/zod/backend/routes/connections/refresh-cached-column/refresh-cached-column-request';
import { zToBackendRefreshCachedColumnResponse } from '#common/zod/backend/routes/connections/refresh-cached-column/refresh-cached-column-response';

export class ToBackendRefreshCachedColumnRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendRefreshCachedColumnRequest })
) {}

export class ToBackendRefreshCachedColumnResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendRefreshCachedColumnResponse })
) {}
