import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendDashboardDoesNotExistError = {
  code: 'BACKEND_DASHBOARD_DOES_NOT_EXIST';
};

export let zBackendDashboardDoesNotExistError = z.object({
  code: z.literal('BACKEND_DASHBOARD_DOES_NOT_EXIST')
});

assertTypesEqual<
  BackendDashboardDoesNotExistError,
  z.infer<typeof zBackendDashboardDoesNotExistError>
>({ value: true });
