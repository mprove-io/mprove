import { z } from 'zod';

export let zStateModelItem = z
  .object({
    modelId: z.string(),
    url: z.string()
  })
  .meta({ id: 'StateModelItem' });

export type StateModelItem = z.infer<typeof zStateModelItem>;
