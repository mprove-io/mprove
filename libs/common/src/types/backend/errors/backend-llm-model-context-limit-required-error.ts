import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendLlmModelContextLimitRequiredError = {
  code: 'BACKEND_LLM_MODEL_CONTEXT_LIMIT_REQUIRED';
};

export let zBackendLlmModelContextLimitRequiredError = z.object({
  code: z.literal('BACKEND_LLM_MODEL_CONTEXT_LIMIT_REQUIRED')
});

assertTypesEqual<
  BackendLlmModelContextLimitRequiredError,
  z.infer<typeof zBackendLlmModelContextLimitRequiredError>
>({ value: true });
