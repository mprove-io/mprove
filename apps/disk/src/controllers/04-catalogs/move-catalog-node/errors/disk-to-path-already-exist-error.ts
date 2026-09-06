import { ErrorFactory } from '@praha/error-factory';
import { ErEnum } from '#common/enums/er.enum';

export class DiskToPathAlreadyExistError extends ErrorFactory({
  name: 'DiskToPathAlreadyExistError',
  message: ErEnum.DISK_TO_PATH_ALREADY_EXIST
}) {}
