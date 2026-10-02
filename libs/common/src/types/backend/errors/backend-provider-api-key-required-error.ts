import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendProviderApiKeyRequiredError = {
  code: 'BACKEND_PROVIDER_API_KEY_REQUIRED';
};

export let zBackendProviderApiKeyRequiredError = z.object({
  code: z.literal('BACKEND_PROVIDER_API_KEY_REQUIRED')
});

assertTypesEqual<
  BackendProviderApiKeyRequiredError,
  z.infer<typeof zBackendProviderApiKeyRequiredError>
>({ value: true });
