import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendGetLlmModelPartsRequest } from '#common/types/backend/routes/llm-models/get-llm-model-parts/get-llm-model-parts-request';
import { zToBackendGetLlmModelPartsResponse } from '#common/types/backend/routes/llm-models/get-llm-model-parts/get-llm-model-parts-response';

export class ToBackendGetLlmModelPartsRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetLlmModelPartsRequest })
) {}

export class ToBackendGetLlmModelPartsResponseDto extends createBackendResponseDto(
  { schema: zToBackendGetLlmModelPartsResponse }
) {}
