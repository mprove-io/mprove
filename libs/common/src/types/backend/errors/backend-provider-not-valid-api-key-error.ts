import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendProviderNotValidApiKeyError = {
  code: 'BACKEND_PROVIDER_NOT_VALID_API_KEY';
};

export let zBackendProviderNotValidApiKeyError = z.object({
  code: z.literal('BACKEND_PROVIDER_NOT_VALID_API_KEY')
});

assertTypesEqual<
  BackendProviderNotValidApiKeyError,
  z.infer<typeof zBackendProviderNotValidApiKeyError>
>({ value: true });
