import { z } from 'zod';
import { FileExtensionEnum } from '#common/enums/file-extension.enum';

export let zFileBasic = z
  .object({
    fileName: z.string(),
    fileExt: z.enum(FileExtensionEnum),
    filePath: z.string(),
    name: z.string()
  })
  .meta({ id: 'FileBasic' });

export type FileBasic = z.infer<typeof zFileBasic>;
