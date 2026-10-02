import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type LlmModelWithProvider,
  zLlmModelWithProvider
} from '#common/types/backend/llm-models/llm-model-with-provider';

export type ToBackendGetLlmModelsWithProviderOutput = {
  modelsOpencode: LlmModelWithProvider[];
  modelsAi: LlmModelWithProvider[];
};

export let zToBackendGetLlmModelsWithProviderOutput = z
  .object({
    modelsOpencode: z.array(zLlmModelWithProvider),
    modelsAi: z.array(zLlmModelWithProvider)
  })
  .meta({ id: 'ToBackendGetLlmModelsWithProviderOutput' });

assertTypesEqual<
  ToBackendGetLlmModelsWithProviderOutput,
  z.infer<typeof zToBackendGetLlmModelsWithProviderOutput>
>({ value: true });
