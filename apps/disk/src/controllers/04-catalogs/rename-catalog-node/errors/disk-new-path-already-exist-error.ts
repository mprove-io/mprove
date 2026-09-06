import { ErrorFactory } from '@praha/error-factory';
import { ErEnum } from '#common/enums/er.enum';

export class DiskNewPathAlreadyExistError extends ErrorFactory({
  name: 'DiskNewPathAlreadyExistError',
  message: ErEnum.DISK_NEW_PATH_ALREADY_EXIST
}) {}
