import { z } from 'zod';
import { zFilePartSpace } from '#common/zod/blockml/internal/file-part-space';
import { zFileSpaceFolder } from '#common/zod/blockml/internal/file-space-folder';

export let zFileSpace = zFilePartSpace
  .extend({
    folders: z.array(zFileSpaceFolder).nullish(),
    folders_line_num: z.number().nullish()
  })
  .meta({ id: 'FileSpace' });

export type FileSpace = z.infer<typeof zFileSpace>;
