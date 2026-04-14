import { z } from 'zod';

export let zStateMetricItem = z
  .object({
    metricId: z.string(),
    name: z.string()
  })
  .meta({ id: 'StateMetricItem' });

export type ZStateMetricItem = z.infer<typeof zStateMetricItem>;
