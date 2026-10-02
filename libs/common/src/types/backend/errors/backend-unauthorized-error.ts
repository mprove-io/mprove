import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendUnauthorizedError = {
  code: 'BACKEND_UNAUTHORIZED';
};

export let zBackendUnauthorizedError = z.object({
  code: z.literal('BACKEND_UNAUTHORIZED')
});

assertTypesEqual<
  BackendUnauthorizedError,
  z.infer<typeof zBackendUnauthorizedError>
>({ value: true });
