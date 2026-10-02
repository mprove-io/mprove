import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type DashboardUnit,
  zDashboardUnit
} from '#common/types/backend/parts/dashboard-unit';

export type ToBackendDeleteDraftDashboardsOutput = {
  dashboardUnitDrafts: DashboardUnit[];
};

export let zToBackendDeleteDraftDashboardsOutput = z
  .object({
    dashboardUnitDrafts: z.array(zDashboardUnit)
  })
  .meta({ id: 'ToBackendDeleteDraftDashboardsOutput' });

assertTypesEqual<
  ToBackendDeleteDraftDashboardsOutput,
  z.infer<typeof zToBackendDeleteDraftDashboardsOutput>
>({ value: true });
