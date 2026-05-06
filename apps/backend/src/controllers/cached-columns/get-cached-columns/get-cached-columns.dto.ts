import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendGetCachedColumnsRequest,
  zToBackendGetCachedColumnsResponse
} from '#common/zod/to-backend/connections/to-backend-get-cached-columns';

export class ToBackendGetCachedColumnsRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetCachedColumnsRequest })
) {}

export class ToBackendGetCachedColumnsResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetCachedColumnsResponse })
) {}
