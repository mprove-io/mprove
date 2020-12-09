import { api } from '../../barrels/api';
import { File2PathContent } from './file-2-path-content';

export interface File2 {
  ext: api.FileExtensionEnum;

  name: string;

  pathContents: File2PathContent[];
}
