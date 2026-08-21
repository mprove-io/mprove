import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import { zToBackendGetLlmModelPartsRequest } from '#common/zod/to-backend/llm-models/get-llm-model-parts/get-llm-model-parts-request';
import { zToBackendGetLlmModelPartsResponse } from '#common/zod/to-backend/llm-models/get-llm-model-parts/get-llm-model-parts-response';

export class ToBackendGetLlmModelPartsRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetLlmModelPartsRequest })
) {}

export class ToBackendGetLlmModelPartsResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetLlmModelPartsResponse })
) {}
