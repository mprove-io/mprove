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
  type ToBackendSaveModifyChartError,
  zToBackendSaveModifyChartError
} from './save-modify-chart-error';

export type ToBackendSaveModifyChartOutput = {
  chart: ChartX;
  chartUnitDrafts: ChartUnit[];
  chartSpaceNodes: SpaceNode[];
};

export type ToBackendSaveModifyChartResponse = ToBackendResponse<
  ToBackendSaveModifyChartOutput,
  ToBackendSaveModifyChartError
>;

export let zToBackendSaveModifyChartOutput = z
  .object({
    chart: zChartX,
    chartUnitDrafts: z.array(zChartUnit),
    chartSpaceNodes: z.array(zSpaceNode)
  })
  .meta({ id: 'ToBackendSaveModifyChartOutput' });

export let zToBackendSaveModifyChartResponse = makeToBackendResponseSchema({
  success: zToBackendSaveModifyChartOutput,
  error: zToBackendSaveModifyChartError
}).meta({ id: 'ToBackendSaveModifyChartResponse' });

assertTypesEqual<
  ToBackendSaveModifyChartOutput,
  z.infer<typeof zToBackendSaveModifyChartOutput>
>({ value: true });

assertTypesEqual<
  ToBackendSaveModifyChartResponse,
  z.infer<typeof zToBackendSaveModifyChartResponse>
>({ value: true });
