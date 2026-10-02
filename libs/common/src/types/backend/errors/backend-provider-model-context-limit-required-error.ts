import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendProviderModelContextLimitRequiredError = {
  code: 'BACKEND_PROVIDER_MODEL_CONTEXT_LIMIT_REQUIRED';
};

export let zBackendProviderModelContextLimitRequiredError = z.object({
  code: z.literal('BACKEND_PROVIDER_MODEL_CONTEXT_LIMIT_REQUIRED')
});

assertTypesEqual<
  BackendProviderModelContextLimitRequiredError,
  z.infer<typeof zBackendProviderModelContextLimitRequiredError>
>({ value: true });
