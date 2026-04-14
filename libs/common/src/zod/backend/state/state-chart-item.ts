import { z } from 'zod';

export let zStateChartItem = z
  .object({
    chartId: z.string(),
    url: z.string()
  })
  .meta({ id: 'StateChartItem' });

export type ZStateChartItem = z.infer<typeof zStateChartItem>;
