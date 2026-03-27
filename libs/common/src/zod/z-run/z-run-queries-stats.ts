import { z } from 'zod';

export let zRunQueriesStats = z.object({
  started: z.number().nullish(),
  running: z.number().nullish(),
  completed: z.number().nullish(),
  error: z.number().nullish(),
  canceled: z.number().nullish()
});
