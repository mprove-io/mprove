import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendProviderNotValidApiKeyError = {
  code: 'BACKEND_PROVIDER_NOT_VALID_API_KEY';
  customData?: {
    originalError?: unknown;
  };
};

export let zBackendProviderNotValidApiKeyError = z.object({
  code: z.literal('BACKEND_PROVIDER_NOT_VALID_API_KEY'),
  customData: z
    .object({
      originalError: z.unknown().nullish()
    })
    .nullish()
});

assertTypesEqual<
  BackendProviderNotValidApiKeyError,
  z.infer<typeof zBackendProviderNotValidApiKeyError>
>({ value: true });
