import type { FileExtensionEnum } from '#common/enums/file-extension.enum';
import type { File2PathContent } from '#common/types/blockml/parts/internal/file-2-path-content';
import type { EnumValues } from '#common/types/enum-values';

export type File2 = {
  ext: EnumValues<typeof FileExtensionEnum>;
  name: string;
  pathContents: File2PathContent[];
};
