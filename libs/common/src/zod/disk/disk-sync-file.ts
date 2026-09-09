import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import {
  type FileStatusEtype,
  zFileStatusEtype
} from '#common/zod/disk/file-status.etype';

export type DiskSyncFile = {
  path: string;
  status?: FileStatusEtype;
  content?: string;
};

export let zDiskSyncFile = z
  .object({
    path: z.string(),
    status: zFileStatusEtype.nullish(),
    content: z.string().nullish()
  })
  .meta({ id: 'DiskSyncFile' });

assertTypesEqual<DiskSyncFile, z.infer<typeof zDiskSyncFile>>({ value: true });
