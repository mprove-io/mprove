import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendHashSecretIsNotDefinedError = {
  code: 'BACKEND_HASH_SECRET_IS_NOT_DEFINED';
};

export let zBackendHashSecretIsNotDefinedError = z.object({
  code: z.literal('BACKEND_HASH_SECRET_IS_NOT_DEFINED')
});

assertTypesEqual<
  BackendHashSecretIsNotDefinedError,
  z.infer<typeof zBackendHashSecretIsNotDefinedError>
>({ value: true });
