import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import { zToBackendCreateLlmModelRequest } from '#common/zod/to-backend/llm-models/create-llm-model/create-llm-model-request';
import { zToBackendCreateLlmModelResponse } from '#common/zod/to-backend/llm-models/create-llm-model/create-llm-model-response';

export class ToBackendCreateLlmModelRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendCreateLlmModelRequest })
) {}

export class ToBackendCreateLlmModelResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendCreateLlmModelResponse })
) {}
