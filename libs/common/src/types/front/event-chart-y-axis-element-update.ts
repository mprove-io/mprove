import { z } from 'zod';
import { zMconfigChartYAxis } from '#common/types/blockml/mconfig-chart-y-axis';

export let zEventChartYAxisElementUpdate = z
  .object({
    yAxisIndex: z.number(),
    yAxisPart: zMconfigChartYAxis
  })
  .meta({ id: 'EventChartYAxisElementUpdate' });

export type EventChartYAxisElementUpdate = z.infer<
  typeof zEventChartYAxisElementUpdate
>;
