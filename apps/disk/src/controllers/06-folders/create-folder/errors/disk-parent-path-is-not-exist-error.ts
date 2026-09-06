import { ErrorFactory } from '@praha/error-factory';
import { ErEnum } from '#common/enums/er.enum';

export class DiskParentPathIsNotExistError extends ErrorFactory({
  name: 'DiskParentPathIsNotExistError',
  message: ErEnum.DISK_PARENT_PATH_IS_NOT_EXIST
}) {}
