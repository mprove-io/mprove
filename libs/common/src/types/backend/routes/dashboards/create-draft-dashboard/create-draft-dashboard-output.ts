import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type DashboardUnit,
  zDashboardUnit
} from '#common/types/backend/parts/dashboard/dashboard-unit';
import {
  type DashboardX,
  zDashboardX
} from '#common/types/backend/parts/dashboard/dashboard-x';

export type ToBackendCreateDraftDashboardOutput = {
  dashboard: DashboardX;
  dashboardUnitDrafts: DashboardUnit[];
};

export let zToBackendCreateDraftDashboardOutput = z
  .object({
    dashboard: zDashboardX,
    dashboardUnitDrafts: z.array(zDashboardUnit)
  })
  .meta({ id: 'ToBackendCreateDraftDashboardOutput' });

assertTypesEqual<
  ToBackendCreateDraftDashboardOutput,
  z.infer<typeof zToBackendCreateDraftDashboardOutput>
>({ value: true });
