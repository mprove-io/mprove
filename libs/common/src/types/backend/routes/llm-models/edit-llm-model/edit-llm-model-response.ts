import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/types/backend/response/to-backend-response-base';
import {
  type ToBackendEditLlmModelOutput,
  zToBackendEditLlmModelOutput
} from '#common/types/backend/routes/llm-models/edit-llm-model/edit-llm-model-output';
import {
  type ToBackendEditLlmModelError,
  zToBackendEditLlmModelError
} from './edit-llm-model-error';

export type ToBackendEditLlmModelResponse = ToBackendResponseBase<
  'editLlmModel',
  ToBackendEditLlmModelOutput,
  ToBackendEditLlmModelError
>;

export let zToBackendEditLlmModelResponse = makeToBackendResponseSchema({
  operation: 'editLlmModel',
  output: zToBackendEditLlmModelOutput,
  error: zToBackendEditLlmModelError
}).meta({ id: 'ToBackendEditLlmModelResponse' });

assertTypesEqual<
  ToBackendEditLlmModelResponse,
  z.infer<typeof zToBackendEditLlmModelResponse>
>({ value: true });
