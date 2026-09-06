import { ErrorFactory } from '@praha/error-factory';
import { ErEnum } from '#common/enums/er.enum';

export class DiskFolderAlreadyExistError extends ErrorFactory({
  name: 'DiskFolderAlreadyExistError',
  message: ErEnum.DISK_FOLDER_ALREADY_EXIST
}) {}
