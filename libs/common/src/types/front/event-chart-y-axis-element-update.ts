import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type MconfigChartYAxis,
  zMconfigChartYAxis
} from '#common/types/blockml/parts/mconfig-chart-y-axis';

export type EventChartYAxisElementUpdate = {
  yAxisIndex: number;
  yAxisPart: MconfigChartYAxis;
};

export let zEventChartYAxisElementUpdate = z
  .object({
    yAxisIndex: z.number(),
    yAxisPart: zMconfigChartYAxis
  })
  .meta({ id: 'EventChartYAxisElementUpdate' });

assertTypesEqual<
  EventChartYAxisElementUpdate,
  z.infer<typeof zEventChartYAxisElementUpdate>
>({ value: true });
