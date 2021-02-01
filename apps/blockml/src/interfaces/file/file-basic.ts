import { api } from '~blockml/barrels/api';

export interface FileBasic {
  fileName: string;
  fileExt: api.FileExtensionEnum;
  filePath: string;

  name: string;
}
