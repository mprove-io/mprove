import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendCreateLlmModelRequest } from '#common/zod/backend/routes/llm-models/create-llm-model/create-llm-model-request';
import { zToBackendCreateLlmModelResponse } from '#common/zod/backend/routes/llm-models/create-llm-model/create-llm-model-response';

export class ToBackendCreateLlmModelRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendCreateLlmModelRequest })
) {}

export class ToBackendCreateLlmModelResponseDto extends createBackendResponseDto(
  { schema: zToBackendCreateLlmModelResponse }
) {}
