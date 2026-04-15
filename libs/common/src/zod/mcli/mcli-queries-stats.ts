import { z } from 'zod';

export let zMcliQueriesStats = z
  .object({
    started: z.number(),
    running: z.number(),
    completed: z.number(),
    error: z.number(),
    canceled: z.number()
  })
  .meta({ id: 'McliQueriesStats' });

export type McliQueriesStats = z.infer<typeof zMcliQueriesStats>;
