import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Provider, zProvider } from '#common/zod/backend/provider';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import {
  type ToBackendEditLlmModelError,
  zToBackendEditLlmModelError
} from './edit-llm-model-error';

export type ToBackendEditLlmModelOutput = {
  provider?: Provider;
};

export type ToBackendEditLlmModelResponse = ToBackendResponse<
  ToBackendEditLlmModelOutput,
  ToBackendEditLlmModelError
>;

export let zToBackendEditLlmModelOutput = z
  .object({ provider: zProvider })
  .meta({ id: 'ToBackendEditLlmModelOutput' });

export let zToBackendEditLlmModelResponse = makeToBackendResponseSchema({
  success: zToBackendEditLlmModelOutput,
  error: zToBackendEditLlmModelError
}).meta({ id: 'ToBackendEditLlmModelResponse' });

assertTypesEqual<
  ToBackendEditLlmModelOutput,
  z.infer<typeof zToBackendEditLlmModelOutput>
>({ value: true });

assertTypesEqual<
  ToBackendEditLlmModelResponse,
  z.infer<typeof zToBackendEditLlmModelResponse>
>({ value: true });
