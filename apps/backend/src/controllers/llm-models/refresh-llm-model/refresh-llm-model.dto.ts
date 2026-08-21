import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import { zToBackendRefreshLlmModelRequest } from '#common/zod/to-backend/llm-models/refresh-llm-model/refresh-llm-model-request';
import { zToBackendRefreshLlmModelResponse } from '#common/zod/to-backend/llm-models/refresh-llm-model/refresh-llm-model-response';

export class ToBackendRefreshLlmModelRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendRefreshLlmModelRequest })
) {}

export class ToBackendRefreshLlmModelResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendRefreshLlmModelResponse })
) {}
