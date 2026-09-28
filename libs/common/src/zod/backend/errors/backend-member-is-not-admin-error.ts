import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendMemberIsNotAdminError = {
  code: 'BACKEND_MEMBER_IS_NOT_ADMIN';
};

export let zBackendMemberIsNotAdminError = z.object({
  code: z.literal('BACKEND_MEMBER_IS_NOT_ADMIN')
});

assertTypesEqual<
  BackendMemberIsNotAdminError,
  z.infer<typeof zBackendMemberIsNotAdminError>
>({ value: true });
