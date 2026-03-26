import { z } from 'zod';

export let zRunTile = z.object({
  title: z.string(),
  query: z.object({
    queryId: z.string(),
    status: z.string(),
    lastErrorMessage: z.string().optional()
  })
});
