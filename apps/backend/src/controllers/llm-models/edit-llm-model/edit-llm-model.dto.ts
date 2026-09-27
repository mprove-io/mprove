import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendEditLlmModelRequest } from '#common/zod/backend/routes/llm-models/edit-llm-model/edit-llm-model-request';
import { zToBackendEditLlmModelResponse } from '#common/zod/backend/routes/llm-models/edit-llm-model/edit-llm-model-response';

export class ToBackendEditLlmModelRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendEditLlmModelRequest })
) {}

export class ToBackendEditLlmModelResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendEditLlmModelResponse })
) {}
