import { enums } from '../barrels/enums';

export interface File3 {
  ext: enums.FileExtensionEnum;
  name: string;
  path: string;
  content: string;
}
