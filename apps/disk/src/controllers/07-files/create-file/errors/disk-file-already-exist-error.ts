import { ErrorFactory } from '@praha/error-factory';
import { ErEnum } from '#common/enums/er.enum';

export class DiskFileAlreadyExistError extends ErrorFactory({
  name: 'DiskFileAlreadyExistError',
  message: ErEnum.DISK_FILE_ALREADY_EXIST
}) {}
