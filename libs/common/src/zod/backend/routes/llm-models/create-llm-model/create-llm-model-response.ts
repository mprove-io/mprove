import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Provider, zProvider } from '#common/zod/backend/provider';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import {
  type ToBackendCreateLlmModelError,
  zToBackendCreateLlmModelError
} from './create-llm-model-error';

export type ToBackendCreateLlmModelOutput = {
  provider?: Provider;
};

export type ToBackendCreateLlmModelResponse = ToBackendResponse<
  ToBackendCreateLlmModelOutput,
  ToBackendCreateLlmModelError
>;

export let zToBackendCreateLlmModelOutput = z
  .object({ provider: zProvider })
  .meta({ id: 'ToBackendCreateLlmModelOutput' });

export let zToBackendCreateLlmModelResponse = makeToBackendResponseSchema({
  success: zToBackendCreateLlmModelOutput,
  error: zToBackendCreateLlmModelError
}).meta({ id: 'ToBackendCreateLlmModelResponse' });

assertTypesEqual<
  ToBackendCreateLlmModelOutput,
  z.infer<typeof zToBackendCreateLlmModelOutput>
>({ value: true });

assertTypesEqual<
  ToBackendCreateLlmModelResponse,
  z.infer<typeof zToBackendCreateLlmModelResponse>
>({ value: true });
