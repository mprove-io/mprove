import type { FileBasic } from '#common/types/blockml/parts/internal/file-basic';
import type { FilePartSpaceFields } from '#common/types/blockml/parts/internal/file-part-space-shape';
import type { Extend } from '#common/types/extend';

export type FilePartSpace = Extend<FileBasic, FilePartSpaceFields>;
