import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/types/backend/response/to-backend-response-base';
import {
  type ToBackendGetLlmModelPartsOutput,
  zToBackendGetLlmModelPartsOutput
} from '#common/types/backend/routes/llm-models/get-llm-model-parts/get-llm-model-parts-output';
import {
  type ToBackendGetLlmModelPartsError,
  zToBackendGetLlmModelPartsError
} from './get-llm-model-parts-error';

export type ToBackendGetLlmModelPartsResponse = ToBackendResponseBase<
  'getLlmModelParts',
  ToBackendGetLlmModelPartsOutput,
  ToBackendGetLlmModelPartsError
>;

export let zToBackendGetLlmModelPartsResponse = makeToBackendResponseSchema({
  operation: 'getLlmModelParts',
  output: zToBackendGetLlmModelPartsOutput,
  error: zToBackendGetLlmModelPartsError
}).meta({ id: 'ToBackendGetLlmModelPartsResponse' });

assertTypesEqual<
  ToBackendGetLlmModelPartsResponse,
  z.infer<typeof zToBackendGetLlmModelPartsResponse>
>({ value: true });
