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
  type ToBackendDeleteDashboardError,
  zToBackendDeleteDashboardError
} from './delete-dashboard-error';

export type ToBackendDeleteDashboardOutput = {
  dashboardUnitDrafts: DashboardUnit[];
  dashboardSpaceNodes: SpaceNode[];
};

export type ToBackendDeleteDashboardResponse = ToBackendResponse<
  ToBackendDeleteDashboardOutput,
  ToBackendDeleteDashboardError
>;

export let zToBackendDeleteDashboardOutput = z
  .object({
    dashboardUnitDrafts: z.array(zDashboardUnit),
    dashboardSpaceNodes: z.array(zSpaceNode)
  })
  .meta({ id: 'ToBackendDeleteDashboardOutput' });

export let zToBackendDeleteDashboardResponse = makeToBackendResponseSchema({
  success: zToBackendDeleteDashboardOutput,
  error: zToBackendDeleteDashboardError
}).meta({ id: 'ToBackendDeleteDashboardResponse' });

assertTypesEqual<
  ToBackendDeleteDashboardOutput,
  z.infer<typeof zToBackendDeleteDashboardOutput>
>({ value: true });

assertTypesEqual<
  ToBackendDeleteDashboardResponse,
  z.infer<typeof zToBackendDeleteDashboardResponse>
>({ value: true });
