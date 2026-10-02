import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/types/backend/response/to-backend-response-base';
import {
  type ToBackendSaveModifyDashboardOutput,
  zToBackendSaveModifyDashboardOutput
} from '#common/types/backend/routes/dashboards/save-modify-dashboard/save-modify-dashboard-output';
import {
  type ToBackendSaveModifyDashboardError,
  zToBackendSaveModifyDashboardError
} from './save-modify-dashboard-error';

export type ToBackendSaveModifyDashboardResponse = ToBackendResponseBase<
  'saveModifyDashboard',
  ToBackendSaveModifyDashboardOutput,
  ToBackendSaveModifyDashboardError
>;

export let zToBackendSaveModifyDashboardResponse = makeToBackendResponseSchema({
  operation: 'saveModifyDashboard',
  output: zToBackendSaveModifyDashboardOutput,
  error: zToBackendSaveModifyDashboardError
}).meta({ id: 'ToBackendSaveModifyDashboardResponse' });

assertTypesEqual<
  ToBackendSaveModifyDashboardResponse,
  z.infer<typeof zToBackendSaveModifyDashboardResponse>
>({ value: true });
