import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/top/create-backend-response-dto/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod/zod-strip-custom/zod-strip-custom';
import { zToBackendSuggestDimensionValuesRequest } from '#common/types/backend/routes/mconfigs/suggest-dimension-values/suggest-dimension-values-request';
import { zToBackendSuggestDimensionValuesResponse } from '#common/types/backend/routes/mconfigs/suggest-dimension-values/suggest-dimension-values-response';

export class ToBackendSuggestDimensionValuesRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendSuggestDimensionValuesRequest })
) {}

export class ToBackendSuggestDimensionValuesResponseDto extends createBackendResponseDto(
  { schema: zToBackendSuggestDimensionValuesResponse }
) {}
