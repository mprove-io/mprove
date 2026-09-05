import { ErrorFactory } from '@praha/error-factory';
import { ErEnum } from '#common/enums/er.enum';

export class DiskTheirBranchIsNotExistError extends ErrorFactory({
  name: 'DiskTheirBranchIsNotExistError',
  message: ErEnum.DISK_THEIR_BRANCH_IS_NOT_EXIST
}) {}
