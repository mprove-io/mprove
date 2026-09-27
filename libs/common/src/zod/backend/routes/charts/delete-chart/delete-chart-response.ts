import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type ChartUnit, zChartUnit } from '#common/zod/backend/chart-unit';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import { type SpaceNode, zSpaceNode } from '#common/zod/backend/space-node';
import {
  type ToBackendDeleteChartError,
  zToBackendDeleteChartError
} from './delete-chart-error';

export type ToBackendDeleteChartOutput = {
  chartUnitDrafts: ChartUnit[];
  chartSpaceNodes: SpaceNode[];
};

export type ToBackendDeleteChartResponse = ToBackendResponse<
  ToBackendDeleteChartOutput,
  ToBackendDeleteChartError
>;

export let zToBackendDeleteChartOutput = z
  .object({
    chartUnitDrafts: z.array(zChartUnit),
    chartSpaceNodes: z.array(zSpaceNode)
  })
  .meta({ id: 'ToBackendDeleteChartOutput' });

export let zToBackendDeleteChartResponse = makeToBackendResponseSchema({
  success: zToBackendDeleteChartOutput,
  error: zToBackendDeleteChartError
}).meta({ id: 'ToBackendDeleteChartResponse' });

assertTypesEqual<
  ToBackendDeleteChartOutput,
  z.infer<typeof zToBackendDeleteChartOutput>
>({ value: true });

assertTypesEqual<
  ToBackendDeleteChartResponse,
  z.infer<typeof zToBackendDeleteChartResponse>
>({ value: true });
