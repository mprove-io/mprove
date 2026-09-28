import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/zod/backend/response/to-backend-response-base';
import {
  type ToBackendCreateLlmModelOutput,
  zToBackendCreateLlmModelOutput
} from '#common/zod/backend/routes/llm-models/create-llm-model/create-llm-model-output';
import {
  type ToBackendCreateLlmModelError,
  zToBackendCreateLlmModelError
} from './create-llm-model-error';

export type ToBackendCreateLlmModelResponse = ToBackendResponseBase<
  'createLlmModel',
  ToBackendCreateLlmModelOutput,
  ToBackendCreateLlmModelError
>;

export let zToBackendCreateLlmModelResponse = makeToBackendResponseSchema({
  operation: 'createLlmModel',
  output: zToBackendCreateLlmModelOutput,
  error: zToBackendCreateLlmModelError
}).meta({ id: 'ToBackendCreateLlmModelResponse' });

assertTypesEqual<
  ToBackendCreateLlmModelResponse,
  z.infer<typeof zToBackendCreateLlmModelResponse>
>({ value: true });
