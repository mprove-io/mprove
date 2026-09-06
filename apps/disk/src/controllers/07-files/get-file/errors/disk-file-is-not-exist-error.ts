import { ErrorFactory } from '@praha/error-factory';
import { ErEnum } from '#common/enums/er.enum';

export class DiskFileIsNotExistError extends ErrorFactory({
  name: 'DiskFileIsNotExistError',
  message: ErEnum.DISK_FILE_IS_NOT_EXIST
}) {}
