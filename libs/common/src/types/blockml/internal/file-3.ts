import { z } from 'zod';
import { FileExtensionEnum } from '#common/enums/file-extension.enum';

export let zFile3 = z
  .object({
    ext: z.enum(FileExtensionEnum),
    name: z.string(),
    path: z.string(),
    content: z.string()
  })
  .meta({ id: 'File3' });

export type File3 = z.infer<typeof zFile3>;
