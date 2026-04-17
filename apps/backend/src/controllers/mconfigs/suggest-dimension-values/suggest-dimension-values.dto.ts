import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendSuggestDimensionValuesRequest,
  zToBackendSuggestDimensionValuesResponse
} from '#common/zod/to-backend/mconfigs/to-backend-suggest-dimension-values';

export class ToBackendSuggestDimensionValuesRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendSuggestDimensionValuesRequest })
) {}

export class ToBackendSuggestDimensionValuesResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendSuggestDimensionValuesResponse })
) {}
