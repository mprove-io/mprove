import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendAdminCannotDeleteHimselfError = {
  code: 'BACKEND_ADMIN_CANNOT_DELETE_HIMSELF';
};

export let zBackendAdminCannotDeleteHimselfError = z.object({
  code: z.literal('BACKEND_ADMIN_CANNOT_DELETE_HIMSELF')
});

assertTypesEqual<
  BackendAdminCannotDeleteHimselfError,
  z.infer<typeof zBackendAdminCannotDeleteHimselfError>
>({ value: true });
