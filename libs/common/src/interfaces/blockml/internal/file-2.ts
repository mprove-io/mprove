import { enums } from '~common/barrels/enums';
import { File2PathContent } from './file-2-path-content';

export interface File2 {
  ext: enums.FileExtensionEnum;
  name: string;
  pathContents: File2PathContent[];
}
