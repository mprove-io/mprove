import { z } from 'zod';
import { FileExtensionEnum } from '#common/enums/file-extension.enum';
import { zFile2PathContent } from '#common/zod/blockml/internal/file-2-path-content';

export let zFile2 = z
  .object({
    ext: z.enum(FileExtensionEnum),
    name: z.string(),
    pathContents: z.array(zFile2PathContent)
  })
  .meta({ id: 'File2' });

export type File2 = z.infer<typeof zFile2>;
