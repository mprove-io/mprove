import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendProviderModelVariantsInvalidError = {
  code: 'BACKEND_PROVIDER_MODEL_VARIANTS_INVALID';
};

export let zBackendProviderModelVariantsInvalidError = z.object({
  code: z.literal('BACKEND_PROVIDER_MODEL_VARIANTS_INVALID')
});

assertTypesEqual<
  BackendProviderModelVariantsInvalidError,
  z.infer<typeof zBackendProviderModelVariantsInvalidError>
>({ value: true });
