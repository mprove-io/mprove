import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendGetLlmModelsWithProviderRequest,
  zToBackendGetLlmModelsWithProviderResponse
} from '#common/zod/to-backend/llm-models/get-llm-models-with-provider/get-llm-models-with-provider';

export class ToBackendGetLlmModelsWithProviderRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetLlmModelsWithProviderRequest })
) {}

export class ToBackendGetLlmModelsWithProviderResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetLlmModelsWithProviderResponse })
) {}
