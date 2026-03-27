import { z } from 'zod';

export let zStateChartItem = z.object({
  chartId: z.string().nullish(),
  url: z.string().nullish()
});
