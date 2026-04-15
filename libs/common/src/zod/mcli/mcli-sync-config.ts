import { z } from 'zod';

export let zMcliSyncConfig = z
  .object({
    lastSyncTime: z.number()
  })
  .meta({ id: 'McliSyncConfig' });

export type McliSyncConfig = z.infer<typeof zMcliSyncConfig>;
