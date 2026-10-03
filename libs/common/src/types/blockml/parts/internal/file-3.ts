import { z } from 'zod';
import { FileExtensionEnum } from '#common/enums/file-extension.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import type { EnumValues } from '#common/types/enum-values';

export type File3 = {
  ext: EnumValues<typeof FileExtensionEnum>;
  name: string;
  path: string;
  content: string;
};

export let zFile3 = z
  .object({
    ext: z.enum(FileExtensionEnum),
    name: z.string(),
    path: z.string(),
    content: z.string()
  })
  .meta({ id: 'File3' });

assertTypesEqual<File3, z.infer<typeof zFile3>>({ value: true });
