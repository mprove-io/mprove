import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendGetSuggestFieldsRequest,
  zToBackendGetSuggestFieldsResponse
} from '#common/zod/to-backend/suggest-fields/to-backend-get-suggest-fields';

export class ToBackendGetSuggestFieldsRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetSuggestFieldsRequest })
) {}

export class ToBackendGetSuggestFieldsResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetSuggestFieldsResponse })
) {}
