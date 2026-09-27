import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type DashboardUnit,
  zDashboardUnit
} from '#common/zod/backend/dashboard-unit';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import {
  type ToBackendDeleteDraftDashboardsError,
  zToBackendDeleteDraftDashboardsError
} from './delete-draft-dashboards-error';

export type ToBackendDeleteDraftDashboardsOutput = {
  dashboardUnitDrafts: DashboardUnit[];
};

export type ToBackendDeleteDraftDashboardsResponse = ToBackendResponse<
  ToBackendDeleteDraftDashboardsOutput,
  ToBackendDeleteDraftDashboardsError
>;

export let zToBackendDeleteDraftDashboardsOutput = z
  .object({
    dashboardUnitDrafts: z.array(zDashboardUnit)
  })
  .meta({ id: 'ToBackendDeleteDraftDashboardsOutput' });

export let zToBackendDeleteDraftDashboardsResponse =
  makeToBackendResponseSchema({
    success: zToBackendDeleteDraftDashboardsOutput,
    error: zToBackendDeleteDraftDashboardsError
  }).meta({ id: 'ToBackendDeleteDraftDashboardsResponse' });

assertTypesEqual<
  ToBackendDeleteDraftDashboardsOutput,
  z.infer<typeof zToBackendDeleteDraftDashboardsOutput>
>({ value: true });

assertTypesEqual<
  ToBackendDeleteDraftDashboardsResponse,
  z.infer<typeof zToBackendDeleteDraftDashboardsResponse>
>({ value: true });
