import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/zod/backend/response/to-backend-response-base';
import {
  type ToBackendGetDashboardOutput,
  zToBackendGetDashboardOutput
} from '#common/zod/backend/routes/dashboards/get-dashboard/get-dashboard-output';
import {
  type ToBackendGetDashboardError,
  zToBackendGetDashboardError
} from './get-dashboard-error';

export type ToBackendGetDashboardResponse = ToBackendResponseBase<
  'getDashboard',
  ToBackendGetDashboardOutput,
  ToBackendGetDashboardError
>;

export let zToBackendGetDashboardResponse = makeToBackendResponseSchema({
  operation: 'getDashboard',
  output: zToBackendGetDashboardOutput,
  error: zToBackendGetDashboardError
}).meta({ id: 'ToBackendGetDashboardResponse' });

assertTypesEqual<
  ToBackendGetDashboardResponse,
  z.infer<typeof zToBackendGetDashboardResponse>
>({ value: true });
