import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendProviderModelDiscoveryFailedError = {
  code: 'BACKEND_PROVIDER_MODEL_DISCOVERY_FAILED';
};

export let zBackendProviderModelDiscoveryFailedError = z.object({
  code: z.literal('BACKEND_PROVIDER_MODEL_DISCOVERY_FAILED')
});

assertTypesEqual<
  BackendProviderModelDiscoveryFailedError,
  z.infer<typeof zBackendProviderModelDiscoveryFailedError>
>({ value: true });
