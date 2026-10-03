import { z } from 'zod';
import { FileExtensionEnum } from '#common/enums/file-extension.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type File2PathContent,
  zFile2PathContent
} from '#common/types/blockml/parts/internal/file-2-path-content';
import type { EnumValues } from '#common/types/enum-values';

export type File2 = {
  ext: EnumValues<typeof FileExtensionEnum>;
  name: string;
  pathContents: File2PathContent[];
};

export let zFile2 = z
  .object({
    ext: z.enum(FileExtensionEnum),
    name: z.string(),
    pathContents: z.array(zFile2PathContent)
  })
  .meta({ id: 'File2' });

assertTypesEqual<File2, z.infer<typeof zFile2>>({ value: true });
