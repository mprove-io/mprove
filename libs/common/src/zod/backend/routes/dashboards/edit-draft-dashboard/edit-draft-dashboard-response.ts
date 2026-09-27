import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type DashboardX, zDashboardX } from '#common/zod/backend/dashboard-x';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import {
  type ToBackendEditDraftDashboardError,
  zToBackendEditDraftDashboardError
} from './edit-draft-dashboard-error';

export type ToBackendEditDraftDashboardOutput = {
  dashboard: DashboardX;
};

export type ToBackendEditDraftDashboardResponse = ToBackendResponse<
  ToBackendEditDraftDashboardOutput,
  ToBackendEditDraftDashboardError
>;

export let zToBackendEditDraftDashboardOutput = z
  .object({
    dashboard: zDashboardX
  })
  .meta({ id: 'ToBackendEditDraftDashboardOutput' });

export let zToBackendEditDraftDashboardResponse = makeToBackendResponseSchema({
  success: zToBackendEditDraftDashboardOutput,
  error: zToBackendEditDraftDashboardError
}).meta({ id: 'ToBackendEditDraftDashboardResponse' });

assertTypesEqual<
  ToBackendEditDraftDashboardOutput,
  z.infer<typeof zToBackendEditDraftDashboardOutput>
>({ value: true });

assertTypesEqual<
  ToBackendEditDraftDashboardResponse,
  z.infer<typeof zToBackendEditDraftDashboardResponse>
>({ value: true });
