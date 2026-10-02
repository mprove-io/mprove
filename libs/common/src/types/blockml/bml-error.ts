import { z } from 'zod';
import { zDiskFileLine } from '#common/types/disk/disk-file-line';

export let zBmlError = z
  .object({
    title: z.string(),
    message: z.string(),
    lines: z.array(zDiskFileLine)
  })
  .meta({ id: 'BmlError' });

export type BmlError = z.infer<typeof zBmlError>;
