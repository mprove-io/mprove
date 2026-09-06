import { ErrorFactory } from '@praha/error-factory';
import { ErEnum } from '#common/enums/er.enum';

export class DiskOldPathIsNotExistError extends ErrorFactory({
  name: 'DiskOldPathIsNotExistError',
  message: ErEnum.DISK_OLD_PATH_IS_NOT_EXIST
}) {}
