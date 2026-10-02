import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendProviderModelAlreadyExistsError = {
  code: 'BACKEND_PROVIDER_MODEL_ALREADY_EXISTS';
};

export let zBackendProviderModelAlreadyExistsError = z.object({
  code: z.literal('BACKEND_PROVIDER_MODEL_ALREADY_EXISTS')
});

assertTypesEqual<
  BackendProviderModelAlreadyExistsError,
  z.infer<typeof zBackendProviderModelAlreadyExistsError>
>({ value: true });
