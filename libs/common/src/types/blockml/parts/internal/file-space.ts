import type { FilePartSpace } from '#common/types/blockml/parts/internal/file-part-space';
import type { FileSpaceFolder } from '#common/types/blockml/parts/internal/file-space-folder';
import type { Extend } from '#common/types/extend';

export type FileSpace = Extend<
  FilePartSpace,
  { folders?: FileSpaceFolder[]; folders_line_num?: number }
>;
