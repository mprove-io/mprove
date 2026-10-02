import { z } from 'zod';

export let zBmlFile = z
  .object({
    name: z.string(),
    path: z.string(),
    pathRelativeToRepo: z.string().nullish(),
    blockmlPath: z.string().nullish(),
    content: z.string()
  })
  .meta({ id: 'BmlFile' });

export type BmlFile = z.infer<typeof zBmlFile>;
