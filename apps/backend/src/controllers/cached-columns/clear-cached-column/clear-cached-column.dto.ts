import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendClearCachedColumnRequest } from '#common/types/backend/routes/connections/clear-cached-column/clear-cached-column-request';
import { zToBackendClearCachedColumnResponse } from '#common/types/backend/routes/connections/clear-cached-column/clear-cached-column-response';

export class ToBackendClearCachedColumnRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendClearCachedColumnRequest })
) {}

export class ToBackendClearCachedColumnResponseDto extends createBackendResponseDto(
  { schema: zToBackendClearCachedColumnResponse }
) {}
