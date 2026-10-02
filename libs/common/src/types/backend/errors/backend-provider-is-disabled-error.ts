import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendProviderIsDisabledError = {
  code: 'BACKEND_PROVIDER_IS_DISABLED';
};

export let zBackendProviderIsDisabledError = z.object({
  code: z.literal('BACKEND_PROVIDER_IS_DISABLED')
});

assertTypesEqual<
  BackendProviderIsDisabledError,
  z.infer<typeof zBackendProviderIsDisabledError>
>({ value: true });
