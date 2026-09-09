import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import { type FileStatus, zFileStatus } from '#common/zod/disk/file-status';

export type DiskFileChange = {
  fileName: string;
  fileId: string;
  parentPath: string;
  status: FileStatus;
  content?: string;
};

export let zDiskFileChange = z
  .object({
    fileName: z.string(),
    fileId: z.string(),
    parentPath: z.string(),
    status: zFileStatus,
    content: z.string().nullish()
  })
  .meta({ id: 'DiskFileChange' });

assertTypesEqual<DiskFileChange, z.infer<typeof zDiskFileChange>>({
  value: true
});
