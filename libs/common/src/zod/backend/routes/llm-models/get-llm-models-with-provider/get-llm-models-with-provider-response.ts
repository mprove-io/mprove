import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type LlmModelWithProvider,
  zLlmModelWithProvider
} from '#common/zod/backend/llm-models/llm-model-with-provider';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import {
  type ToBackendGetLlmModelsWithProviderError,
  zToBackendGetLlmModelsWithProviderError
} from './get-llm-models-with-provider-error';

export type ToBackendGetLlmModelsWithProviderOutput = {
  modelsOpencode: LlmModelWithProvider[];
  modelsAi: LlmModelWithProvider[];
};

export type ToBackendGetLlmModelsWithProviderResponse = ToBackendResponse<
  ToBackendGetLlmModelsWithProviderOutput,
  ToBackendGetLlmModelsWithProviderError
>;

export let zToBackendGetLlmModelsWithProviderOutput = z
  .object({
    modelsOpencode: z.array(zLlmModelWithProvider),
    modelsAi: z.array(zLlmModelWithProvider)
  })
  .meta({ id: 'ToBackendGetLlmModelsWithProviderOutput' });

export let zToBackendGetLlmModelsWithProviderResponse =
  makeToBackendResponseSchema({
    success: zToBackendGetLlmModelsWithProviderOutput,
    error: zToBackendGetLlmModelsWithProviderError
  }).meta({ id: 'ToBackendGetLlmModelsWithProviderResponse' });

assertTypesEqual<
  ToBackendGetLlmModelsWithProviderOutput,
  z.infer<typeof zToBackendGetLlmModelsWithProviderOutput>
>({ value: true });

assertTypesEqual<
  ToBackendGetLlmModelsWithProviderResponse,
  z.infer<typeof zToBackendGetLlmModelsWithProviderResponse>
>({ value: true });
