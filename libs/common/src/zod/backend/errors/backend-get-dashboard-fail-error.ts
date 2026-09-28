import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type BmlError, zBmlError } from '#common/zod/blockml/bml-error';

export type BackendGetDashboardFailError = {
  code: 'BACKEND_GET_DASHBOARD_FAIL';
  displayData?: { structErrors: BmlError[] };
};

export let zBackendGetDashboardFailError = z.object({
  code: z.literal('BACKEND_GET_DASHBOARD_FAIL'),
  displayData: z.object({ structErrors: z.array(zBmlError) }).nullish()
});

assertTypesEqual<
  BackendGetDashboardFailError,
  z.infer<typeof zBackendGetDashboardFailError>
>({ value: true });
