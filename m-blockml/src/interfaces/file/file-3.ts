import { api } from '~/barrels/api';

export interface File3 {
  ext: api.FileExtensionEnum;
  name: string;
  path: string;
  content: string;
}
