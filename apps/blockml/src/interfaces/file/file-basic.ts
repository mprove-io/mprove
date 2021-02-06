import { common } from '~blockml/barrels/common';

export interface FileBasic {
  fileName: string;
  fileExt: common.FileExtensionEnum;
  filePath: string;

  name: string;
}
