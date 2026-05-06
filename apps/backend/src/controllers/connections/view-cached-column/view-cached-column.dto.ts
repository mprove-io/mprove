import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendViewCachedColumnRequest,
  zToBackendViewCachedColumnResponse
} from '#common/zod/to-backend/connections/to-backend-view-cached-column';

export class ToBackendViewCachedColumnRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendViewCachedColumnRequest })
) {}

export class ToBackendViewCachedColumnResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendViewCachedColumnResponse })
) {}
