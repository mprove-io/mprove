import type { FileExtensionEnum } from '#common/enums/file-extension.enum';
import type { EnumValues } from '#common/types/enum-values';

export type File3 = {
  ext: EnumValues<typeof FileExtensionEnum>;
  name: string;
  path: string;
  content: string;
};
