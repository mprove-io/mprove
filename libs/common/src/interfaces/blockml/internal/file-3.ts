import { FileExtensionEnum } from '~common/enums/file-extension.enum';

export interface File3 {
  ext: FileExtensionEnum;
  name: string;
  path: string;
  content: string;
}
