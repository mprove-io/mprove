import { ErrorFactory } from '@praha/error-factory';
import { ErEnum } from '#common/enums/er.enum';

export class DiskFolderIsNotExistError extends ErrorFactory({
  name: 'DiskFolderIsNotExistError',
  message: ErEnum.DISK_FOLDER_IS_NOT_EXIST
}) {}
