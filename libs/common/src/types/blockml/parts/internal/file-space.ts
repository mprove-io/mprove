import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type FilePartSpace,
  zFilePartSpace
} from '#common/types/blockml/parts/internal/file-part-space';
import {
  type FileSpaceFolder,
  zFileSpaceFolder
} from '#common/types/blockml/parts/internal/file-space-folder';
import type { Extend } from '#common/types/extend';

export type FileSpace = Extend<
  FilePartSpace,
  { folders?: FileSpaceFolder[]; folders_line_num?: number }
>;

export let zFileSpace = zFilePartSpace
  .extend({
    folders: z.array(zFileSpaceFolder).nullish(),
    folders_line_num: z.number().nullish()
  })
  .meta({ id: 'FileSpace' });

assertTypesEqual<FileSpace, z.infer<typeof zFileSpace>>({ value: true });
