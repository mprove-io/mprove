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
import { type SpaceNode, zSpaceNode } from '#common/zod/backend/space-node';
import {
  type ToBackendSaveCreateDashboardError,
  zToBackendSaveCreateDashboardError
} from './save-create-dashboard-error';

export type ToBackendSaveCreateDashboardOutput = {
  dashboardUnitDrafts: DashboardUnit[];
  dashboardSpaceNodes: SpaceNode[];
};

export type ToBackendSaveCreateDashboardResponse = ToBackendResponse<
  ToBackendSaveCreateDashboardOutput,
  ToBackendSaveCreateDashboardError
>;

export let zToBackendSaveCreateDashboardOutput = z
  .object({
    dashboardUnitDrafts: z.array(zDashboardUnit),
    dashboardSpaceNodes: z.array(zSpaceNode)
  })
  .meta({ id: 'ToBackendSaveCreateDashboardOutput' });

export let zToBackendSaveCreateDashboardResponse = makeToBackendResponseSchema({
  success: zToBackendSaveCreateDashboardOutput,
  error: zToBackendSaveCreateDashboardError
}).meta({ id: 'ToBackendSaveCreateDashboardResponse' });

assertTypesEqual<
  ToBackendSaveCreateDashboardOutput,
  z.infer<typeof zToBackendSaveCreateDashboardOutput>
>({ value: true });

assertTypesEqual<
  ToBackendSaveCreateDashboardResponse,
  z.infer<typeof zToBackendSaveCreateDashboardResponse>
>({ value: true });
