import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type DashboardUnit,
  zDashboardUnit
} from '#common/zod/backend/dashboard-unit';
import { type Member, zMember } from '#common/zod/backend/member';
import { type ModelX, zModelX } from '#common/zod/backend/model-x';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import { type SpaceNode, zSpaceNode } from '#common/zod/backend/space-node';
import { type StructX, zStructX } from '#common/zod/backend/struct-x';
import {
  type ToBackendGetDashboardsError,
  zToBackendGetDashboardsError
} from './get-dashboards-error';

export type ToBackendGetDashboardsOutput = {
  needValidate: boolean;
  struct: StructX;
  userMember: Member;
  models: ModelX[];
  dashboardUnitDrafts: DashboardUnit[];
  dashboardSpaceNodes: SpaceNode[];
};

export type ToBackendGetDashboardsResponse = ToBackendResponse<
  ToBackendGetDashboardsOutput,
  ToBackendGetDashboardsError
>;

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

export let zToBackendGetDashboardsResponse = makeToBackendResponseSchema({
  success: zToBackendGetDashboardsOutput,
  error: zToBackendGetDashboardsError
}).meta({ id: 'ToBackendGetDashboardsResponse' });

assertTypesEqual<
  ToBackendGetDashboardsOutput,
  z.infer<typeof zToBackendGetDashboardsOutput>
>({ value: true });

assertTypesEqual<
  ToBackendGetDashboardsResponse,
  z.infer<typeof zToBackendGetDashboardsResponse>
>({ value: true });
