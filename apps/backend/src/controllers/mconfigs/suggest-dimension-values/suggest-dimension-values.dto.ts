import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendSuggestDimensionValuesRequest } from '#common/zod/backend/routes/mconfigs/suggest-dimension-values/suggest-dimension-values-request';
import { zToBackendSuggestDimensionValuesResponse } from '#common/zod/backend/routes/mconfigs/suggest-dimension-values/suggest-dimension-values-response';

export class ToBackendSuggestDimensionValuesRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendSuggestDimensionValuesRequest })
) {}

export class ToBackendSuggestDimensionValuesResponseDto extends createBackendResponseDto(
  { schema: zToBackendSuggestDimensionValuesResponse }
) {}
