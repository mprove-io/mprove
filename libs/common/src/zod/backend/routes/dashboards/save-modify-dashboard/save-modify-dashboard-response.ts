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
import { type SpaceNode, zSpaceNode } from '#common/zod/backend/space-node';
import {
  type ToBackendSaveModifyDashboardError,
  zToBackendSaveModifyDashboardError
} from './save-modify-dashboard-error';

export type ToBackendSaveModifyDashboardOutput = {
  dashboard: DashboardX;
  dashboardUnitDrafts: DashboardUnit[];
  dashboardSpaceNodes: SpaceNode[];
};

export type ToBackendSaveModifyDashboardResponse = ToBackendResponse<
  ToBackendSaveModifyDashboardOutput,
  ToBackendSaveModifyDashboardError
>;

export let zToBackendSaveModifyDashboardOutput = z
  .object({
    dashboard: zDashboardX,
    dashboardUnitDrafts: z.array(zDashboardUnit),
    dashboardSpaceNodes: z.array(zSpaceNode)
  })
  .meta({ id: 'ToBackendSaveModifyDashboardOutput' });

export let zToBackendSaveModifyDashboardResponse = makeToBackendResponseSchema({
  success: zToBackendSaveModifyDashboardOutput,
  error: zToBackendSaveModifyDashboardError
}).meta({ id: 'ToBackendSaveModifyDashboardResponse' });

assertTypesEqual<
  ToBackendSaveModifyDashboardOutput,
  z.infer<typeof zToBackendSaveModifyDashboardOutput>
>({ value: true });

assertTypesEqual<
  ToBackendSaveModifyDashboardResponse,
  z.infer<typeof zToBackendSaveModifyDashboardResponse>
>({ value: true });
