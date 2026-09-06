import { ErrorFactory } from '@praha/error-factory';
import { ErEnum } from '#common/enums/er.enum';

export class DiskDefaultBranchCannotBeDeletedError extends ErrorFactory({
  name: 'DiskDefaultBranchCannotBeDeletedError',
  message: ErEnum.DISK_DEFAULT_BRANCH_CANNOT_BE_DELETED
}) {}
