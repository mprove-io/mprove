import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendGetCachedColumnsRequest } from '#common/zod/backend/routes/connections/get-cached-columns/get-cached-columns-request';
import { zToBackendGetCachedColumnsResponse } from '#common/zod/backend/routes/connections/get-cached-columns/get-cached-columns-response';

export class ToBackendGetCachedColumnsRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetCachedColumnsRequest })
) {}

export class ToBackendGetCachedColumnsResponseDto extends createBackendResponseDto(
  { schema: zToBackendGetCachedColumnsResponse }
) {}
