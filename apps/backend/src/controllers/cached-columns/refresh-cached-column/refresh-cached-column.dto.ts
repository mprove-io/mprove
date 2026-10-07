import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/top/create-backend-response-dto/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod/zod-strip-custom/zod-strip-custom';
import { zToBackendRefreshCachedColumnRequest } from '#common/types/backend/routes/connections/refresh-cached-column/refresh-cached-column-request';
import { zToBackendRefreshCachedColumnResponse } from '#common/types/backend/routes/connections/refresh-cached-column/refresh-cached-column-response';

export class ToBackendRefreshCachedColumnRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendRefreshCachedColumnRequest })
) {}

export class ToBackendRefreshCachedColumnResponseDto extends createBackendResponseDto(
  { schema: zToBackendRefreshCachedColumnResponse }
) {}
