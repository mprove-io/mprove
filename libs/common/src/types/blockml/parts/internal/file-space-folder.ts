import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type FilePartSpaceFields,
  zFilePartSpaceShape
} from '#common/types/blockml/parts/internal/file-part-space-shape';
import type { Extend } from '#common/types/extend';

export type FileSpaceFolder = Extend<
  FilePartSpaceFields,
  {
    folders?: FileSpaceFolder[];
    folders_line_num?: number;
  }
>;

export let zFileSpaceFolder = z.object(zFilePartSpaceShape).extend({
  get folders(): z.ZodOptional<
    z.ZodNullable<z.ZodArray<z.ZodType<FileSpaceFolder>>>
  > {
    return z.array(zFileSpaceFolder).nullish();
  },
  folders_line_num: z.number().nullish()
});

assertTypesEqual<FileSpaceFolder, z.infer<typeof zFileSpaceFolder>>({
  value: true
});
