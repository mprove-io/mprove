import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type DashboardUnit,
  zDashboardUnit
} from '#common/zod/backend/dashboard-unit';
import { type DashboardX, zDashboardX } from '#common/zod/backend/dashboard-x';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import {
  type ToBackendCreateDraftDashboardError,
  zToBackendCreateDraftDashboardError
} from './create-draft-dashboard-error';

export type ToBackendCreateDraftDashboardOutput = {
  dashboard: DashboardX;
  dashboardUnitDrafts: DashboardUnit[];
};

export type ToBackendCreateDraftDashboardResponse = ToBackendResponse<
  ToBackendCreateDraftDashboardOutput,
  ToBackendCreateDraftDashboardError
>;

export let zToBackendCreateDraftDashboardOutput = z
  .object({
    dashboard: zDashboardX,
    dashboardUnitDrafts: z.array(zDashboardUnit)
  })
  .meta({ id: 'ToBackendCreateDraftDashboardOutput' });

export let zToBackendCreateDraftDashboardResponse = makeToBackendResponseSchema(
  {
    success: zToBackendCreateDraftDashboardOutput,
    error: zToBackendCreateDraftDashboardError
  }
).meta({ id: 'ToBackendCreateDraftDashboardResponse' });

assertTypesEqual<
  ToBackendCreateDraftDashboardOutput,
  z.infer<typeof zToBackendCreateDraftDashboardOutput>
>({ value: true });

assertTypesEqual<
  ToBackendCreateDraftDashboardResponse,
  z.infer<typeof zToBackendCreateDraftDashboardResponse>
>({ value: true });
