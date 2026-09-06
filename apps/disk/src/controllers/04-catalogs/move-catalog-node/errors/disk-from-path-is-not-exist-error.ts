import { ErrorFactory } from '@praha/error-factory';
import { ErEnum } from '#common/enums/er.enum';

export class DiskFromPathIsNotExistError extends ErrorFactory({
  name: 'DiskFromPathIsNotExistError',
  message: ErEnum.DISK_FROM_PATH_IS_NOT_EXIST
}) {}
