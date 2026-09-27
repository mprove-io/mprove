import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendClearCachedColumnRequest } from '#common/zod/backend/routes/connections/clear-cached-column/clear-cached-column-request';
import { zToBackendClearCachedColumnResponse } from '#common/zod/backend/routes/connections/clear-cached-column/clear-cached-column-response';

export class ToBackendClearCachedColumnRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendClearCachedColumnRequest })
) {}

export class ToBackendClearCachedColumnResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendClearCachedColumnResponse })
) {}
