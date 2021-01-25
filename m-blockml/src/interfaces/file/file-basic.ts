import { api } from '~/barrels/api';

export interface FileBasic {
  fileName: string;
  fileExt: api.FileExtensionEnum;
  filePath: string;

  name: string;
}
