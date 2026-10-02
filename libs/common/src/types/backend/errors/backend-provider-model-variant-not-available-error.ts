import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendProviderModelVariantNotAvailableError = {
  code: 'BACKEND_PROVIDER_MODEL_VARIANT_NOT_AVAILABLE';
};

export let zBackendProviderModelVariantNotAvailableError = z.object({
  code: z.literal('BACKEND_PROVIDER_MODEL_VARIANT_NOT_AVAILABLE')
});

assertTypesEqual<
  BackendProviderModelVariantNotAvailableError,
  z.infer<typeof zBackendProviderModelVariantNotAvailableError>
>({ value: true });
