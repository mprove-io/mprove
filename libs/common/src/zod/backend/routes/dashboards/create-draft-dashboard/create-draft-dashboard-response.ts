import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/zod/backend/response/to-backend-response-base';
import {
  type ToBackendCreateDraftDashboardOutput,
  zToBackendCreateDraftDashboardOutput
} from '#common/zod/backend/routes/dashboards/create-draft-dashboard/create-draft-dashboard-output';
import {
  type ToBackendCreateDraftDashboardError,
  zToBackendCreateDraftDashboardError
} from './create-draft-dashboard-error';

export type ToBackendCreateDraftDashboardResponse = ToBackendResponseBase<
  'createDraftDashboard',
  ToBackendCreateDraftDashboardOutput,
  ToBackendCreateDraftDashboardError
>;

export let zToBackendCreateDraftDashboardResponse = makeToBackendResponseSchema(
  {
    operation: 'createDraftDashboard',
    output: zToBackendCreateDraftDashboardOutput,
    error: zToBackendCreateDraftDashboardError
  }
).meta({ id: 'ToBackendCreateDraftDashboardResponse' });

assertTypesEqual<
  ToBackendCreateDraftDashboardResponse,
  z.infer<typeof zToBackendCreateDraftDashboardResponse>
>({ value: true });
