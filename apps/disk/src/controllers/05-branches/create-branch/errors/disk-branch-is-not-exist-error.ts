import { ErrorFactory } from '@praha/error-factory';
import { ErEnum } from '#common/enums/er.enum';

export class DiskBranchIsNotExistError extends ErrorFactory({
  name: 'DiskBranchIsNotExistError',
  message: ErEnum.DISK_BRANCH_IS_NOT_EXIST
}) {}
