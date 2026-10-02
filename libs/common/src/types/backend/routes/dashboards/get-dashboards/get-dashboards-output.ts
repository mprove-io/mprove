import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type DashboardUnit,
  zDashboardUnit
} from '#common/types/backend/dashboard-unit';
import { type Member, zMember } from '#common/types/backend/member';
import { type ModelX, zModelX } from '#common/types/backend/model-x';
import { type SpaceNode, zSpaceNode } from '#common/types/backend/space-node';
import { type StructX, zStructX } from '#common/types/backend/struct-x';

export type ToBackendGetDashboardsOutput = {
  needValidate: boolean;
  struct: StructX;
  userMember: Member;
  models: ModelX[];
  dashboardUnitDrafts: DashboardUnit[];
  dashboardSpaceNodes: SpaceNode[];
};

export let zToBackendGetDashboardsOutput = z
  .object({
    needValidate: z.boolean(),
    struct: zStructX,
    userMember: zMember,
    models: z.array(zModelX),
    dashboardUnitDrafts: z.array(zDashboardUnit),
    dashboardSpaceNodes: z.array(zSpaceNode)
  })
  .meta({ id: 'ToBackendGetDashboardsOutput' });

assertTypesEqual<
  ToBackendGetDashboardsOutput,
  z.infer<typeof zToBackendGetDashboardsOutput>
>({ value: true });
