import type { FileExtension } from '#common/types/blockml/parts/file/file-extension';

import type { File2PathContent } from '#common/types/blockml/parts/internal/file/file-2-path-content';

export type File2 = {
  ext: FileExtension;
  name: string;
  pathContents: File2PathContent[];
};
