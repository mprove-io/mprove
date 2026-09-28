import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/zod/backend/response/to-backend-response-base';
import {
  type ToBackendDeleteLlmModelOutput,
  zToBackendDeleteLlmModelOutput
} from '#common/zod/backend/routes/llm-models/delete-llm-model/delete-llm-model-output';
import {
  type ToBackendDeleteLlmModelError,
  zToBackendDeleteLlmModelError
} from './delete-llm-model-error';

export type ToBackendDeleteLlmModelResponse = ToBackendResponseBase<
  'deleteLlmModel',
  ToBackendDeleteLlmModelOutput,
  ToBackendDeleteLlmModelError
>;

export let zToBackendDeleteLlmModelResponse = makeToBackendResponseSchema({
  operation: 'deleteLlmModel',
  output: zToBackendDeleteLlmModelOutput,
  error: zToBackendDeleteLlmModelError
}).meta({ id: 'ToBackendDeleteLlmModelResponse' });

assertTypesEqual<
  ToBackendDeleteLlmModelResponse,
  z.infer<typeof zToBackendDeleteLlmModelResponse>
>({ value: true });
