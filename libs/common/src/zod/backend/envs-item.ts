import { z } from 'zod';

export let zEnvsItem = z
  .object({
    envId: z.string(),
    projectId: z.string()
  })
  .meta({ id: 'EnvsItem' });

export type EnvsItem = z.infer<typeof zEnvsItem>;
