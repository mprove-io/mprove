import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendIdempUserMismatchError = {
  code: 'BACKEND_IDEMP_USER_MISMATCH';
};

export let zBackendIdempUserMismatchError = z.object({
  code: z.literal('BACKEND_IDEMP_USER_MISMATCH')
});

assertTypesEqual<
  BackendIdempUserMismatchError,
  z.infer<typeof zBackendIdempUserMismatchError>
>({ value: true });
