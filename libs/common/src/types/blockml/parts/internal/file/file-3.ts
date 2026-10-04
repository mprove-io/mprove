import type { FileExtension } from '#common/types/blockml/parts/file/file-extension';

export type File3 = {
  ext: FileExtension;
  name: string;
  path: string;
  content: string;
};
