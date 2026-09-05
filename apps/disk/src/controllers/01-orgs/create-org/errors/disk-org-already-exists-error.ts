import { ErrorFactory } from '@praha/error-factory';
import { ErEnum } from '#common/enums/er.enum';

export class DiskOrgAlreadyExistsError extends ErrorFactory({
  name: 'DiskOrgAlreadyExistsError',
  message: ErEnum.DISK_ORG_ALREADY_EXIST
}) {}
