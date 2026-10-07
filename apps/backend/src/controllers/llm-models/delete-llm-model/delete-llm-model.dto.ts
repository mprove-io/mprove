import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/top/create-backend-response-dto/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod/zod-strip-custom/zod-strip-custom';
import { zToBackendDeleteLlmModelRequest } from '#common/types/backend/routes/llm-models/delete-llm-model/delete-llm-model-request';
import { zToBackendDeleteLlmModelResponse } from '#common/types/backend/routes/llm-models/delete-llm-model/delete-llm-model-response';

export class ToBackendDeleteLlmModelRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDeleteLlmModelRequest })
) {}

export class ToBackendDeleteLlmModelResponseDto extends createBackendResponseDto(
  { schema: zToBackendDeleteLlmModelResponse }
) {}
