import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendProviderTypeMismatchError = {
  code: 'BACKEND_PROVIDER_TYPE_MISMATCH';
};

export let zBackendProviderTypeMismatchError = z.object({
  code: z.literal('BACKEND_PROVIDER_TYPE_MISMATCH')
});

assertTypesEqual<
  BackendProviderTypeMismatchError,
  z.infer<typeof zBackendProviderTypeMismatchError>
>({ value: true });
