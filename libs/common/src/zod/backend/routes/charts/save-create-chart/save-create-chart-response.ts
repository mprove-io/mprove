import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type ChartUnit, zChartUnit } from '#common/zod/backend/chart-unit';
import { type ChartX, zChartX } from '#common/zod/backend/chart-x';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import { type SpaceNode, zSpaceNode } from '#common/zod/backend/space-node';
import {
  type ToBackendSaveCreateChartError,
  zToBackendSaveCreateChartError
} from './save-create-chart-error';

export type ToBackendSaveCreateChartOutput = {
  chart: ChartX;
  chartUnitDrafts: ChartUnit[];
  chartSpaceNodes: SpaceNode[];
};

export type ToBackendSaveCreateChartResponse = ToBackendResponse<
  ToBackendSaveCreateChartOutput,
  ToBackendSaveCreateChartError
>;

export let zToBackendSaveCreateChartOutput = z
  .object({
    chart: zChartX,
    chartUnitDrafts: z.array(zChartUnit),
    chartSpaceNodes: z.array(zSpaceNode)
  })
  .meta({ id: 'ToBackendSaveCreateChartOutput' });

export let zToBackendSaveCreateChartResponse = makeToBackendResponseSchema({
  success: zToBackendSaveCreateChartOutput,
  error: zToBackendSaveCreateChartError
}).meta({ id: 'ToBackendSaveCreateChartResponse' });

assertTypesEqual<
  ToBackendSaveCreateChartOutput,
  z.infer<typeof zToBackendSaveCreateChartOutput>
>({ value: true });

assertTypesEqual<
  ToBackendSaveCreateChartResponse,
  z.infer<typeof zToBackendSaveCreateChartResponse>
>({ value: true });
