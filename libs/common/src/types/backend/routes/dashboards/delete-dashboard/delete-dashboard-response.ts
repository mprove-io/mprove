import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/types/backend/response/to-backend-response-base';
import {
  type ToBackendDeleteDashboardOutput,
  zToBackendDeleteDashboardOutput
} from '#common/types/backend/routes/dashboards/delete-dashboard/delete-dashboard-output';
import {
  type ToBackendDeleteDashboardError,
  zToBackendDeleteDashboardError
} from './delete-dashboard-error';

export type ToBackendDeleteDashboardResponse = ToBackendResponseBase<
  'deleteDashboard',
  ToBackendDeleteDashboardOutput,
  ToBackendDeleteDashboardError
>;

export let zToBackendDeleteDashboardResponse = makeToBackendResponseSchema({
  operation: 'deleteDashboard',
  output: zToBackendDeleteDashboardOutput,
  error: zToBackendDeleteDashboardError
}).meta({ id: 'ToBackendDeleteDashboardResponse' });

assertTypesEqual<
  ToBackendDeleteDashboardResponse,
  z.infer<typeof zToBackendDeleteDashboardResponse>
>({ value: true });
