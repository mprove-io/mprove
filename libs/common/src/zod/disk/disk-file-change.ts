import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import {
  type FileStatusEtype,
  zFileStatusEtype
} from '#common/zod/disk/file-status.etype';

export type DiskFileChange = {
  fileName: string;
  fileId: string;
  parentPath: string;
  status: FileStatusEtype;
  content?: string;
};

export let zDiskFileChange = z
  .object({
    fileName: z.string(),
    fileId: z.string(),
    parentPath: z.string(),
    status: zFileStatusEtype,
    content: z.string().nullish()
  })
  .meta({ id: 'DiskFileChange' });

assertTypesEqual<DiskFileChange, z.infer<typeof zDiskFileChange>>({
  value: true
});
