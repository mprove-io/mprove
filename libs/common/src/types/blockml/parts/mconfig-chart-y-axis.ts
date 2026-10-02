import { z } from 'zod';

export let zMconfigChartYAxis = z
  .object({
    scale: z.boolean()
  })
  .meta({ id: 'MconfigChartYAxis' });

export type MconfigChartYAxis = z.infer<typeof zMconfigChartYAxis>;
