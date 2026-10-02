import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/types/backend/response/to-backend-response-base';
import {
  type ToBackendSaveCreateDashboardOutput,
  zToBackendSaveCreateDashboardOutput
} from '#common/types/backend/routes/dashboards/save-create-dashboard/save-create-dashboard-output';
import {
  type ToBackendSaveCreateDashboardError,
  zToBackendSaveCreateDashboardError
} from './save-create-dashboard-error';

export type ToBackendSaveCreateDashboardResponse = ToBackendResponseBase<
  'saveCreateDashboard',
  ToBackendSaveCreateDashboardOutput,
  ToBackendSaveCreateDashboardError
>;

export let zToBackendSaveCreateDashboardResponse = makeToBackendResponseSchema({
  operation: 'saveCreateDashboard',
  output: zToBackendSaveCreateDashboardOutput,
  error: zToBackendSaveCreateDashboardError
}).meta({ id: 'ToBackendSaveCreateDashboardResponse' });

assertTypesEqual<
  ToBackendSaveCreateDashboardResponse,
  z.infer<typeof zToBackendSaveCreateDashboardResponse>
>({ value: true });
