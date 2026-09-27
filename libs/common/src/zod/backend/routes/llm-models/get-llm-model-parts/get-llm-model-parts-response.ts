import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type LlmModelPart,
  zLlmModelPart
} from '#common/zod/backend/llm-models/llm-model-part';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import {
  type ToBackendGetLlmModelPartsError,
  zToBackendGetLlmModelPartsError
} from './get-llm-model-parts-error';

export type ToBackendGetLlmModelPartsOutput = {
  modelParts: LlmModelPart[];
  errorMessage?: string;
};

export type ToBackendGetLlmModelPartsResponse = ToBackendResponse<
  ToBackendGetLlmModelPartsOutput,
  ToBackendGetLlmModelPartsError
>;

export let zToBackendGetLlmModelPartsOutput = z
  .strictObject({
    modelParts: z.array(zLlmModelPart),
    errorMessage: z.string().nullish()
  })
  .meta({ id: 'ToBackendGetLlmModelPartsOutput' });

export let zToBackendGetLlmModelPartsResponse = makeToBackendResponseSchema({
  success: zToBackendGetLlmModelPartsOutput,
  error: zToBackendGetLlmModelPartsError
}).meta({ id: 'ToBackendGetLlmModelPartsResponse' });

assertTypesEqual<
  ToBackendGetLlmModelPartsOutput,
  z.infer<typeof zToBackendGetLlmModelPartsOutput>
>({ value: true });

assertTypesEqual<
  ToBackendGetLlmModelPartsResponse,
  z.infer<typeof zToBackendGetLlmModelPartsResponse>
>({ value: true });
