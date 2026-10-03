import type { FilePartSpaceFields } from '#common/types/blockml/parts/internal/file-part-space-shape';
import type { Extend } from '#common/types/extend';

export type FileSpaceFolder = Extend<
  FilePartSpaceFields,
  {
    folders?: FileSpaceFolder[];
    folders_line_num?: number;
  }
>;
