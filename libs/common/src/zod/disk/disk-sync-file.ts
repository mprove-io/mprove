import { z } from 'zod';
import { FileStatusEnum } from '#common/enums/file-status.enum';

export let zDiskSyncFile = z
  .object({
    path: z.string(),
    status: z.enum(FileStatusEnum).nullish(),
    content: z.string().nullish(),
    modifiedTime: z.number().nullish()
  })
  .meta({ id: 'DiskSyncFile' });

export type DiskSyncFile = z.infer<typeof zDiskSyncFile>;
