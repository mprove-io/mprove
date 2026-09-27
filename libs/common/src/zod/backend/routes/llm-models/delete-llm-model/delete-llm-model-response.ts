import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Provider, zProvider } from '#common/zod/backend/provider';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import {
  type ToBackendDeleteLlmModelError,
  zToBackendDeleteLlmModelError
} from './delete-llm-model-error';

export type ToBackendDeleteLlmModelOutput = {
  provider?: Provider;
};

export type ToBackendDeleteLlmModelResponse = ToBackendResponse<
  ToBackendDeleteLlmModelOutput,
  ToBackendDeleteLlmModelError
>;

export let zToBackendDeleteLlmModelOutput = z
  .object({ provider: zProvider })
  .meta({ id: 'ToBackendDeleteLlmModelOutput' });

export let zToBackendDeleteLlmModelResponse = makeToBackendResponseSchema({
  success: zToBackendDeleteLlmModelOutput,
  error: zToBackendDeleteLlmModelError
}).meta({ id: 'ToBackendDeleteLlmModelResponse' });

assertTypesEqual<
  ToBackendDeleteLlmModelOutput,
  z.infer<typeof zToBackendDeleteLlmModelOutput>
>({ value: true });

assertTypesEqual<
  ToBackendDeleteLlmModelResponse,
  z.infer<typeof zToBackendDeleteLlmModelResponse>
>({ value: true });
