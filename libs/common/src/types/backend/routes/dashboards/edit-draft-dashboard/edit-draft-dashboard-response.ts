import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/types/backend/response/to-backend-response-base';
import {
  type ToBackendEditDraftDashboardOutput,
  zToBackendEditDraftDashboardOutput
} from '#common/types/backend/routes/dashboards/edit-draft-dashboard/edit-draft-dashboard-output';
import {
  type ToBackendEditDraftDashboardError,
  zToBackendEditDraftDashboardError
} from './edit-draft-dashboard-error';

export type ToBackendEditDraftDashboardResponse = ToBackendResponseBase<
  'editDraftDashboard',
  ToBackendEditDraftDashboardOutput,
  ToBackendEditDraftDashboardError
>;

export let zToBackendEditDraftDashboardResponse = makeToBackendResponseSchema({
  operation: 'editDraftDashboard',
  output: zToBackendEditDraftDashboardOutput,
  error: zToBackendEditDraftDashboardError
}).meta({ id: 'ToBackendEditDraftDashboardResponse' });

assertTypesEqual<
  ToBackendEditDraftDashboardResponse,
  z.infer<typeof zToBackendEditDraftDashboardResponse>
>({ value: true });
