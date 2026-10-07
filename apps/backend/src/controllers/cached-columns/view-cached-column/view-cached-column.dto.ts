import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/top/create-backend-response-dto/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod/zod-strip-custom/zod-strip-custom';
import { zToBackendViewCachedColumnRequest } from '#common/types/backend/routes/connections/view-cached-column/view-cached-column-request';
import { zToBackendViewCachedColumnResponse } from '#common/types/backend/routes/connections/view-cached-column/view-cached-column-response';

export class ToBackendViewCachedColumnRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendViewCachedColumnRequest })
) {}

export class ToBackendViewCachedColumnResponseDto extends createBackendResponseDto(
  { schema: zToBackendViewCachedColumnResponse }
) {}
