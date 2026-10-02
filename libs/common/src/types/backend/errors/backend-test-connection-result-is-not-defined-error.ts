import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendTestConnectionResultIsNotDefinedError = {
  code: 'BACKEND_TEST_CONNECTION_RESULT_IS_NOT_DEFINED';
};

export let zBackendTestConnectionResultIsNotDefinedError = z.object({
  code: z.literal('BACKEND_TEST_CONNECTION_RESULT_IS_NOT_DEFINED')
});

assertTypesEqual<
  BackendTestConnectionResultIsNotDefinedError,
  z.infer<typeof zBackendTestConnectionResultIsNotDefinedError>
>({ value: true });
