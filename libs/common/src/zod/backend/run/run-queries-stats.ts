import { z } from 'zod';

export let zRunQueriesStats = z
  .object({
    started: z.number().int(),
    running: z.number().int(),
    completed: z.number().int(),
    error: z.number().int(),
    canceled: z.number().int()
  })
  .meta({ id: 'RunQueriesStats' });

export type ZRunQueriesStats = z.infer<typeof zRunQueriesStats>;
