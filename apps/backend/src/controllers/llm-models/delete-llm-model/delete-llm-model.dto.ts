import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import { zToBackendDeleteLlmModelRequest } from '#common/zod/to-backend/llm-models/delete-llm-model/delete-llm-model-request';
import { zToBackendDeleteLlmModelResponse } from '#common/zod/to-backend/llm-models/delete-llm-model/delete-llm-model-response';

export class ToBackendDeleteLlmModelRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDeleteLlmModelRequest })
) {}

export class ToBackendDeleteLlmModelResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDeleteLlmModelResponse })
) {}
