import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendProviderAlreadyExistsError = {
  code: 'BACKEND_PROVIDER_ALREADY_EXISTS';
};

export let zBackendProviderAlreadyExistsError = z.object({
  code: z.literal('BACKEND_PROVIDER_ALREADY_EXISTS')
});

assertTypesEqual<
  BackendProviderAlreadyExistsError,
  z.infer<typeof zBackendProviderAlreadyExistsError>
>({ value: true });
