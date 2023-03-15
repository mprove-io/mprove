import { enums } from '~common/barrels/enums';

export interface FileBasic {
  fileName: string;
  fileExt: enums.FileExtensionEnum;
  filePath: string;

  name: string;
}
