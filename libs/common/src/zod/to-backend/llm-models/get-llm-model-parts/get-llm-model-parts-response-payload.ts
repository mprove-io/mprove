import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import {
  type LlmModelPart,
  zLlmModelPart
} from '#common/zod/backend/llm-models/llm-model-part';

export type ToBackendGetLlmModelPartsResponsePayload = {
  modelParts: LlmModelPart[];
  errorMessage?: string;
};

export let zToBackendGetLlmModelPartsResponsePayload = z
  .strictObject({
    modelParts: z.array(zLlmModelPart),
    errorMessage: z.string().nullish()
  })
  .meta({ id: 'ToBackendGetLlmModelPartsResponsePayload' });

assertTypesEqual<
  ToBackendGetLlmModelPartsResponsePayload,
  z.infer<typeof zToBackendGetLlmModelPartsResponsePayload>
>({ value: true });
