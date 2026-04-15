import { z } from 'zod';

export let zEventChartToggleYAxisElement = z
  .object({
    yAxisIndex: z.number()
  })
  .meta({ id: 'EventChartToggleYAxisElement' });

export type EventChartToggleYAxisElement = z.infer<
  typeof zEventChartToggleYAxisElement
>;
