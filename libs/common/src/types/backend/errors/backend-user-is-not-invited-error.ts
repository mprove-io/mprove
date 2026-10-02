import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendUserIsNotInvitedError = {
  code: 'BACKEND_USER_IS_NOT_INVITED';
};

export let zBackendUserIsNotInvitedError = z.object({
  code: z.literal('BACKEND_USER_IS_NOT_INVITED')
});

assertTypesEqual<
  BackendUserIsNotInvitedError,
  z.infer<typeof zBackendUserIsNotInvitedError>
>({ value: true });
