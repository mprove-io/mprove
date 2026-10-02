import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type ChartUnit, zChartUnit } from '#common/types/backend/chart-unit';
import { type SpaceNode, zSpaceNode } from '#common/types/backend/space-node';

export type ToBackendDeleteChartOutput = {
  chartUnitDrafts: ChartUnit[];
  chartSpaceNodes: SpaceNode[];
};

export let zToBackendDeleteChartOutput = z
  .object({
    chartUnitDrafts: z.array(zChartUnit),
    chartSpaceNodes: z.array(zSpaceNode)
  })
  .meta({ id: 'ToBackendDeleteChartOutput' });

assertTypesEqual<
  ToBackendDeleteChartOutput,
  z.infer<typeof zToBackendDeleteChartOutput>
>({ value: true });
