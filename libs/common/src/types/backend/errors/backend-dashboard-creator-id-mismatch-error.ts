import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendDashboardCreatorIdMismatchError = {
  code: 'BACKEND_DASHBOARD_CREATOR_ID_MISMATCH';
};

export let zBackendDashboardCreatorIdMismatchError = z.object({
  code: z.literal('BACKEND_DASHBOARD_CREATOR_ID_MISMATCH')
});

assertTypesEqual<
  BackendDashboardCreatorIdMismatchError,
  z.infer<typeof zBackendDashboardCreatorIdMismatchError>
>({ value: true });
