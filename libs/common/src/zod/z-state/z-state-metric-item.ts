import { z } from 'zod';

export let zStateMetricItem = z.object({
  metricId: z.string().nullish(),
  name: z.string().nullish()
});
