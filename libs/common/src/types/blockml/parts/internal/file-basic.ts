import { z } from 'zod';
import { FileExtensionEnum } from '#common/enums/file-extension.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import type { EnumValues } from '#common/types/enum-values';

export type FileBasic = {
  fileName: string;
  fileExt: EnumValues<typeof FileExtensionEnum>;
  filePath: string;
  name: string;
};

export let zFileBasic = z
  .object({
    fileName: z.string(),
    fileExt: z.enum(FileExtensionEnum),
    filePath: z.string(),
    name: z.string()
  })
  .meta({ id: 'FileBasic' });

assertTypesEqual<FileBasic, z.infer<typeof zFileBasic>>({ value: true });
