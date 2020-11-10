import { api } from '../barrels/api';

export interface FileTopBasic {
  fileName: string;
  fileExt: api.FileExtensionEnum;
  filePath: string;

  name: string;

  filters: {
    [s: string]: string[];
  };
}
