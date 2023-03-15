import { enums } from '~common/barrels/enums';

export interface File3 {
  ext: enums.FileExtensionEnum;
  name: string;
  path: string;
  content: string;
}
