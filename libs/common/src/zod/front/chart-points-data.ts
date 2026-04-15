import { z } from 'zod';

export let zChartPointsData = z
  .object({
    dataPoints: z.any(),
    newQueriesLength: z.number(),
    runningQueriesLength: z.number()
  })
  .meta({ id: 'ChartPointsData' });

export type ChartPointsData = z.infer<typeof zChartPointsData>;
