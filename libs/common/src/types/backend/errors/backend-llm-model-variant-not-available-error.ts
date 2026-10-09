import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendLlmModelVariantNotAvailableError = {
  code: 'BACKEND_LLM_MODEL_VARIANT_NOT_AVAILABLE';
};

export let zBackendLlmModelVariantNotAvailableError = z.object({
  code: z.literal('BACKEND_LLM_MODEL_VARIANT_NOT_AVAILABLE')
});

assertTypesEqual<
  BackendLlmModelVariantNotAvailableError,
  z.infer<typeof zBackendLlmModelVariantNotAvailableError>
>({ value: true });
