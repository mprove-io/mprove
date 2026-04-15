import { z } from 'zod';
import { FileStatusEnum } from '#common/enums/file-status.enum';

export let zDiskFileChange = z
  .object({
    fileName: z.string(),
    fileId: z.string(),
    parentPath: z.string(),
    status: z.enum(FileStatusEnum),
    content: z.string().nullish()
  })
  .meta({ id: 'DiskFileChange' });

export type DiskFileChange = z.infer<typeof zDiskFileChange>;
