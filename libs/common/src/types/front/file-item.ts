import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type FileItem = {
  fileName: string;
  fileId: string;
  fileNodeId: string;
  parentPath: string;
};

export let zFileItem = z
  .object({
    fileName: z.string(),
    fileId: z.string(),
    fileNodeId: z.string(),
    parentPath: z.string()
  })
  .meta({ id: 'FileItem' });

assertTypesEqual<FileItem, z.infer<typeof zFileItem>>({ value: true });
