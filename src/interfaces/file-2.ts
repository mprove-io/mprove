import { enums } from '../barrels/enums';

export interface File2 {
  ext: enums.FileExtensionEnum;
  name: string;
  filePaths: { path: string; content: string }[];
}
