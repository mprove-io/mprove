import { api } from '../barrels/api';

export interface TopBasic {
  ext: api.FileExtensionEnum;
  file: string;
  name: string;
  path: string;

  filters: {
    [s: string]: string[];
  };
}
