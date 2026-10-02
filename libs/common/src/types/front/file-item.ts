import { z } from 'zod';

export let zFileItem = z
  .object({
    fileName: z.string(),
    fileId: z.string(),
    fileNodeId: z.string(),
    parentPath: z.string()
  })
  .meta({ id: 'FileItem' });

export type FileItem = z.infer<typeof zFileItem>;
