import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendProviderDoesNotExistError = {
  code: 'BACKEND_PROVIDER_DOES_NOT_EXIST';
};

export let zBackendProviderDoesNotExistError = z.object({
  code: z.literal('BACKEND_PROVIDER_DOES_NOT_EXIST')
});

assertTypesEqual<
  BackendProviderDoesNotExistError,
  z.infer<typeof zBackendProviderDoesNotExistError>
>({ value: true });
