import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendForbiddenDashboardError = {
  code: 'BACKEND_FORBIDDEN_DASHBOARD';
};

export let zBackendForbiddenDashboardError = z.object({
  code: z.literal('BACKEND_FORBIDDEN_DASHBOARD')
});

assertTypesEqual<
  BackendForbiddenDashboardError,
  z.infer<typeof zBackendForbiddenDashboardError>
>({ value: true });
