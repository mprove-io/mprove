import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type ChartUnit,
  zChartUnit
} from '#common/types/backend/parts/chart/chart-unit';
import {
  type ChartX,
  zChartX
} from '#common/types/backend/parts/chart/chart-x';
import {
  type SpaceNode,
  zSpaceNode
} from '#common/types/backend/parts/space-node';

export type ToBackendSaveCreateChartOutput = {
  chart: ChartX;
  chartUnitDrafts: ChartUnit[];
  chartSpaceNodes: SpaceNode[];
};

export let zToBackendSaveCreateChartOutput = z
  .object({
    chart: zChartX,
    chartUnitDrafts: z.array(zChartUnit),
    chartSpaceNodes: z.array(zSpaceNode)
  })
  .meta({ id: 'ToBackendSaveCreateChartOutput' });

assertTypesEqual<
  ToBackendSaveCreateChartOutput,
  z.infer<typeof zToBackendSaveCreateChartOutput>
>({ value: true });
