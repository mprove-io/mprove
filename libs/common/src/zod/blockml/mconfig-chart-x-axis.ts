import { z } from 'zod';

export let zMconfigChartXAxis = z
  .object({
    scale: z.boolean()
  })
  .meta({ id: 'MconfigChartXAxis' });

export type MconfigChartXAxis = z.infer<typeof zMconfigChartXAxis>;
