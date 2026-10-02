import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type DashboardUnit,
  zDashboardUnit
} from '#common/types/backend/dashboard-unit';
import { type SpaceNode, zSpaceNode } from '#common/types/backend/space-node';

export type ToBackendSaveCreateDashboardOutput = {
  dashboardUnitDrafts: DashboardUnit[];
  dashboardSpaceNodes: SpaceNode[];
};

export let zToBackendSaveCreateDashboardOutput = z
  .object({
    dashboardUnitDrafts: z.array(zDashboardUnit),
    dashboardSpaceNodes: z.array(zSpaceNode)
  })
  .meta({ id: 'ToBackendSaveCreateDashboardOutput' });

assertTypesEqual<
  ToBackendSaveCreateDashboardOutput,
  z.infer<typeof zToBackendSaveCreateDashboardOutput>
>({ value: true });
