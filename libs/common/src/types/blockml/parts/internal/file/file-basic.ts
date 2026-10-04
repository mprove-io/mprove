import type { FileExtension } from '#common/types/blockml/parts/file/file-extension';

export type FileBasic = {
  fileName: string;
  fileExt: FileExtension;
  filePath: string;
  name: string;
};
