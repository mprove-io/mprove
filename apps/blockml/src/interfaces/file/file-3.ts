import { api } from '~blockml/barrels/api';

export interface File3 {
  ext: api.FileExtensionEnum;
  name: string;
  path: string;
  content: string;
}
