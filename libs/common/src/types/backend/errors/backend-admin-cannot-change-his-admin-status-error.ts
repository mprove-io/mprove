import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendAdminCannotChangeHisAdminStatusError = {
  code: 'BACKEND_ADMIN_CANNOT_CHANGE_HIS_ADMIN_STATUS';
};

export let zBackendAdminCannotChangeHisAdminStatusError = z.object({
  code: z.literal('BACKEND_ADMIN_CANNOT_CHANGE_HIS_ADMIN_STATUS')
});

assertTypesEqual<
  BackendAdminCannotChangeHisAdminStatusError,
  z.infer<typeof zBackendAdminCannotChangeHisAdminStatusError>
>({ value: true });
