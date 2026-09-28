import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendProviderModelDoesNotExistError = {
  code: 'BACKEND_PROVIDER_MODEL_DOES_NOT_EXIST';
};

export let zBackendProviderModelDoesNotExistError = z.object({
  code: z.literal('BACKEND_PROVIDER_MODEL_DOES_NOT_EXIST')
});

assertTypesEqual<
  BackendProviderModelDoesNotExistError,
  z.infer<typeof zBackendProviderModelDoesNotExistError>
>({ value: true });
