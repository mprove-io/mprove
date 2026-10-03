import type { FileExtensionEnum } from '#common/enums/file-extension.enum';
import type { EnumValues } from '#common/types/enum-values';

export type FileBasic = {
  fileName: string;
  fileExt: EnumValues<typeof FileExtensionEnum>;
  filePath: string;
  name: string;
};
