import { enums } from '../barrels/enums';

export interface TopBasic {
  ext: enums.FileExtensionEnum;
  file: string;
  name: string;
  path: string;

  filters: {
    [s: string]: string[];
  };
}
