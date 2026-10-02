import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendProviderModelNotDiscoveredError = {
  code: 'BACKEND_PROVIDER_MODEL_NOT_DISCOVERED';
};

export let zBackendProviderModelNotDiscoveredError = z.object({
  code: z.literal('BACKEND_PROVIDER_MODEL_NOT_DISCOVERED')
});

assertTypesEqual<
  BackendProviderModelNotDiscoveredError,
  z.infer<typeof zBackendProviderModelNotDiscoveredError>
>({ value: true });
