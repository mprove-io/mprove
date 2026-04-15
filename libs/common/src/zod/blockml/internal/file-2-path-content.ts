import { z } from 'zod';

export let zFile2PathContent = z
  .object({
    path: z.string(),
    content: z.string()
  })
  .meta({ id: 'File2PathContent' });

export type File2PathContent = z.infer<typeof zFile2PathContent>;
