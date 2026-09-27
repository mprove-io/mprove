import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendGetLlmModelsWithProviderRequest } from '#common/zod/backend/routes/llm-models/get-llm-models-with-provider/get-llm-models-with-provider-request';
import { zToBackendGetLlmModelsWithProviderResponse } from '#common/zod/backend/routes/llm-models/get-llm-models-with-provider/get-llm-models-with-provider-response';

export class ToBackendGetLlmModelsWithProviderRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetLlmModelsWithProviderRequest })
) {}

export class ToBackendGetLlmModelsWithProviderResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetLlmModelsWithProviderResponse })
) {}
