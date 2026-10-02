import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendEditLlmModelRequest } from '#common/types/backend/routes/llm-models/edit-llm-model/edit-llm-model-request';
import { zToBackendEditLlmModelResponse } from '#common/types/backend/routes/llm-models/edit-llm-model/edit-llm-model-response';

export class ToBackendEditLlmModelRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendEditLlmModelRequest })
) {}

export class ToBackendEditLlmModelResponseDto extends createBackendResponseDto({
  schema: zToBackendEditLlmModelResponse
}) {}
