import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendProviderModelLimitInvalidError = {
  code: 'BACKEND_PROVIDER_MODEL_LIMIT_INVALID';
};

export let zBackendProviderModelLimitInvalidError = z.object({
  code: z.literal('BACKEND_PROVIDER_MODEL_LIMIT_INVALID')
});

assertTypesEqual<
  BackendProviderModelLimitInvalidError,
  z.infer<typeof zBackendProviderModelLimitInvalidError>
>({ value: true });
