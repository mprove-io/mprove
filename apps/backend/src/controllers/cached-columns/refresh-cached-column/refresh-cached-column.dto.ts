import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendRefreshCachedColumnRequest } from '#common/zod/backend/routes/connections/refresh-cached-column/refresh-cached-column-request';
import { zToBackendRefreshCachedColumnResponse } from '#common/zod/backend/routes/connections/refresh-cached-column/refresh-cached-column-response';

export class ToBackendRefreshCachedColumnRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendRefreshCachedColumnRequest })
) {}

export class ToBackendRefreshCachedColumnResponseDto extends createBackendResponseDto(
  { schema: zToBackendRefreshCachedColumnResponse }
) {}
