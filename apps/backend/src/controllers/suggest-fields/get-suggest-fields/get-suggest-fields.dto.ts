import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendGetSuggestFieldsRequest } from '#common/zod/backend/routes/suggest-fields/get-suggest-fields/get-suggest-fields-request';
import { zToBackendGetSuggestFieldsResponse } from '#common/zod/backend/routes/suggest-fields/get-suggest-fields/get-suggest-fields-response';

export class ToBackendGetSuggestFieldsRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetSuggestFieldsRequest })
) {}

export class ToBackendGetSuggestFieldsResponseDto extends createBackendResponseDto(
  { schema: zToBackendGetSuggestFieldsResponse }
) {}
