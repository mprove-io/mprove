import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/top/create-backend-response-dto/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod/zod-strip-custom/zod-strip-custom';
import { zToBackendGetLlmModelsWithProviderRequest } from '#common/types/backend/routes/llm-models/get-llm-models-with-provider/get-llm-models-with-provider-request';
import { zToBackendGetLlmModelsWithProviderResponse } from '#common/types/backend/routes/llm-models/get-llm-models-with-provider/get-llm-models-with-provider-response';

export class ToBackendGetLlmModelsWithProviderRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetLlmModelsWithProviderRequest })
) {}

export class ToBackendGetLlmModelsWithProviderResponseDto extends createBackendResponseDto(
  { schema: zToBackendGetLlmModelsWithProviderResponse }
) {}
