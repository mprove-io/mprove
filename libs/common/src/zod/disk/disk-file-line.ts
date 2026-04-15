import { z } from 'zod';

export let zDiskFileLine = z
  .object({
    fileId: z.string(),
    fileName: z.string(),
    lineNumber: z.number().int()
  })
  .meta({ id: 'DiskFileLine' });

export type DiskFileLine = z.infer<typeof zDiskFileLine>;
