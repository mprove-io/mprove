import { z } from 'zod';

export let zEventChartDeleteYAxisElement = z
  .object({
    yAxisIndex: z.number()
  })
  .meta({ id: 'EventChartDeleteYAxisElement' });

export type EventChartDeleteYAxisElement = z.infer<
  typeof zEventChartDeleteYAxisElement
>;
