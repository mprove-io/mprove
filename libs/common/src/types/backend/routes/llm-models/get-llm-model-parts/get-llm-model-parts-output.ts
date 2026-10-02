import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type LlmModelPart,
  zLlmModelPart
} from '#common/types/backend/llm-models/llm-model-part';

export type ToBackendGetLlmModelPartsOutput = {
  modelParts: LlmModelPart[];
  errorMessage?: string;
};

export let zToBackendGetLlmModelPartsOutput = z
  .strictObject({
    modelParts: z.array(zLlmModelPart),
    errorMessage: z.string().nullish()
  })
  .meta({ id: 'ToBackendGetLlmModelPartsOutput' });

assertTypesEqual<
  ToBackendGetLlmModelPartsOutput,
  z.infer<typeof zToBackendGetLlmModelPartsOutput>
>({ value: true });
