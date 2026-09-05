import { ErrorFactory } from '@praha/error-factory';
import { ErEnum } from '#common/enums/er.enum';

export class DiskProjectAlreadyExistsError extends ErrorFactory({
  name: 'DiskProjectAlreadyExistsError',
  message: ErEnum.DISK_PROJECT_ALREADY_EXIST
}) {}
