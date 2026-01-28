import { FileExtensionEnum } from '#common/enums/file-extension.enum';
import { File2PathContent } from './file-2-path-content';

export interface File2 {
  ext: FileExtensionEnum;
  name: string;
  pathContents: File2PathContent[];
}
