import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendRestrictedUserError = {
  code: 'BACKEND_RESTRICTED_USER';
};

export let zBackendRestrictedUserError = z.object({
  code: z.literal('BACKEND_RESTRICTED_USER')
});

assertTypesEqual<
  BackendRestrictedUserError,
  z.infer<typeof zBackendRestrictedUserError>
>({ value: true });
