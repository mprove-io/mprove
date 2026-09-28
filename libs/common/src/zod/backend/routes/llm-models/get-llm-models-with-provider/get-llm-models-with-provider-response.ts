import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/zod/backend/response/to-backend-response-base';
import {
  type ToBackendGetLlmModelsWithProviderOutput,
  zToBackendGetLlmModelsWithProviderOutput
} from '#common/zod/backend/routes/llm-models/get-llm-models-with-provider/get-llm-models-with-provider-output';
import {
  type ToBackendGetLlmModelsWithProviderError,
  zToBackendGetLlmModelsWithProviderError
} from './get-llm-models-with-provider-error';

export type ToBackendGetLlmModelsWithProviderResponse = ToBackendResponseBase<
  'getLlmModelsWithProvider',
  ToBackendGetLlmModelsWithProviderOutput,
  ToBackendGetLlmModelsWithProviderError
>;

export let zToBackendGetLlmModelsWithProviderResponse =
  makeToBackendResponseSchema({
    operation: 'getLlmModelsWithProvider',
    output: zToBackendGetLlmModelsWithProviderOutput,
    error: zToBackendGetLlmModelsWithProviderError
  }).meta({ id: 'ToBackendGetLlmModelsWithProviderResponse' });

assertTypesEqual<
  ToBackendGetLlmModelsWithProviderResponse,
  z.infer<typeof zToBackendGetLlmModelsWithProviderResponse>
>({ value: true });
