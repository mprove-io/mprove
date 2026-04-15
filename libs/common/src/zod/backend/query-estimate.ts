import { z } from 'zod';

export let zQueryEstimate = z
  .object({
    queryId: z.string(),
    estimate: z.number().int(),
    lastRunDryTs: z.number()
  })
  .meta({ id: 'QueryEstimate' });

export type QueryEstimate = z.infer<typeof zQueryEstimate>;
