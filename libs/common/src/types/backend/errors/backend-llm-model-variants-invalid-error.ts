import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendLlmModelVariantsInvalidError = {
  code: 'BACKEND_LLM_MODEL_VARIANTS_INVALID';
};

export let zBackendLlmModelVariantsInvalidError = z.object({
  code: z.literal('BACKEND_LLM_MODEL_VARIANTS_INVALID')
});

assertTypesEqual<
  BackendLlmModelVariantsInvalidError,
  z.infer<typeof zBackendLlmModelVariantsInvalidError>
>({ value: true });
