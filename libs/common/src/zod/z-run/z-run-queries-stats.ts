import { z } from 'zod';

export let zRunQueriesStats = z.object({
  started: z.number(),
  running: z.number(),
  completed: z.number(),
  error: z.number(),
  canceled: z.number()
});
