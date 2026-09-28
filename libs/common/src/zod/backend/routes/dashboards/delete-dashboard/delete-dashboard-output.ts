import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type DashboardUnit,
  zDashboardUnit
} from '#common/zod/backend/dashboard-unit';
import { type SpaceNode, zSpaceNode } from '#common/zod/backend/space-node';

export type ToBackendDeleteDashboardOutput = {
  dashboardUnitDrafts: DashboardUnit[];
  dashboardSpaceNodes: SpaceNode[];
};

export let zToBackendDeleteDashboardOutput = z
  .object({
    dashboardUnitDrafts: z.array(zDashboardUnit),
    dashboardSpaceNodes: z.array(zSpaceNode)
  })
  .meta({ id: 'ToBackendDeleteDashboardOutput' });

assertTypesEqual<
  ToBackendDeleteDashboardOutput,
  z.infer<typeof zToBackendDeleteDashboardOutput>
>({ value: true });
