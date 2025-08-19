import { FileExtensionEnum } from '~common/enums/file-extension.enum';

export interface FileBasic {
  fileName: string;
  fileExt: FileExtensionEnum;
  filePath: string;

  name: string;
}
