import { z } from 'zod';
import { zFilePartSpaceShape } from '#common/zod/blockml/internal/file-part-space-shape';

let zFileSpaceFolderBase = z.object(zFilePartSpaceShape);

export type FileSpaceFolder = z.infer<typeof zFileSpaceFolderBase> & {
  folders?: FileSpaceFolder[];
  folders_line_num?: number;
};

export let zFileSpaceFolder: z.ZodType<FileSpaceFolder> =
  zFileSpaceFolderBase.extend({
    get folders() {
      return z.array(zFileSpaceFolder).nullish();
    },
    folders_line_num: z.number().nullish()
  });
