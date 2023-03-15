import { common } from '~blockml/barrels/common';
import { File2PathContent } from './file-2-path-content';

export interface File2 {
  ext: common.FileExtensionEnum;
  name: string;
  pathContents: File2PathContent[];
}
