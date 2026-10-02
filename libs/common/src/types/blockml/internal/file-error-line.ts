import { z } from 'zod';

export let zFileErrorLine = z
  .object({
    line: z.number(),
    name: z.string(),
    path: z.string()
  })
  .meta({ id: 'FileErrorLine' });

export type FileErrorLine = z.infer<typeof zFileErrorLine>;
