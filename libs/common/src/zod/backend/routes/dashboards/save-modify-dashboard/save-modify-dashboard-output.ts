import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type DashboardUnit,
  zDashboardUnit
} from '#common/zod/backend/dashboard-unit';
import { type DashboardX, zDashboardX } from '#common/zod/backend/dashboard-x';
import { type SpaceNode, zSpaceNode } from '#common/zod/backend/space-node';

export type ToBackendSaveModifyDashboardOutput = {
  dashboard: DashboardX;
  dashboardUnitDrafts: DashboardUnit[];
  dashboardSpaceNodes: SpaceNode[];
};

export let zToBackendSaveModifyDashboardOutput = z
  .object({
    dashboard: zDashboardX,
    dashboardUnitDrafts: z.array(zDashboardUnit),
    dashboardSpaceNodes: z.array(zSpaceNode)
  })
  .meta({ id: 'ToBackendSaveModifyDashboardOutput' });

assertTypesEqual<
  ToBackendSaveModifyDashboardOutput,
  z.infer<typeof zToBackendSaveModifyDashboardOutput>
>({ value: true });
