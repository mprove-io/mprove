import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendDashboardNotFoundError = {
  code: 'BACKEND_DASHBOARD_NOT_FOUND';
  displayData?: { id: string };
};

export let zBackendDashboardNotFoundError = z.object({
  code: z.literal('BACKEND_DASHBOARD_NOT_FOUND'),
  displayData: z.object({ id: z.string() }).nullish()
});

assertTypesEqual<
  BackendDashboardNotFoundError,
  z.infer<typeof zBackendDashboardNotFoundError>
>({ value: true });
