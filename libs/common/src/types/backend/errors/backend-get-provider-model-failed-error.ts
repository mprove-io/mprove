import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendGetProviderModelFailedError = {
  code: 'BACKEND_GET_PROVIDER_MODEL_FAILED';
};

export let zBackendGetProviderModelFailedError = z.object({
  code: z.literal('BACKEND_GET_PROVIDER_MODEL_FAILED')
});

assertTypesEqual<
  BackendGetProviderModelFailedError,
  z.infer<typeof zBackendGetProviderModelFailedError>
>({ value: true });
