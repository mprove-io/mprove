import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendUserIsNotServerAdminError = {
  code: 'BACKEND_USER_IS_NOT_SERVER_ADMIN';
};

export let zBackendUserIsNotServerAdminError = z.object({
  code: z.literal('BACKEND_USER_IS_NOT_SERVER_ADMIN')
});

assertTypesEqual<
  BackendUserIsNotServerAdminError,
  z.infer<typeof zBackendUserIsNotServerAdminError>
>({ value: true });
