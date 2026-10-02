import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendThrottlerUserIdIsNotDefinedError = {
  code: 'BACKEND_THROTTLER_USER_ID_IS_NOT_DEFINED';
};

export let zBackendThrottlerUserIdIsNotDefinedError = z.object({
  code: z.literal('BACKEND_THROTTLER_USER_ID_IS_NOT_DEFINED')
});

assertTypesEqual<
  BackendThrottlerUserIdIsNotDefinedError,
  z.infer<typeof zBackendThrottlerUserIdIsNotDefinedError>
>({ value: true });
