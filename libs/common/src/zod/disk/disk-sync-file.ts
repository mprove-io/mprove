import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import { type FileStatus, zFileStatus } from '#common/zod/disk/file-status';

export type DiskSyncFile = {
  path: string;
  status?: FileStatus;
  content?: string;
};

export let zDiskSyncFile = z
  .object({
    path: z.string(),
    status: zFileStatus.nullish(),
    content: z.string().nullish()
  })
  .meta({ id: 'DiskSyncFile' });

assertTypesEqual<DiskSyncFile, z.infer<typeof zDiskSyncFile>>({ value: true });
