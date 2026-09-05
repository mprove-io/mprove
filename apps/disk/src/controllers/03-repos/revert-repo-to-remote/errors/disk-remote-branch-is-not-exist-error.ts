import { ErrorFactory } from '@praha/error-factory';
import { ErEnum } from '#common/enums/er.enum';

export class DiskRemoteBranchIsNotExistError extends ErrorFactory({
  name: 'DiskRemoteBranchIsNotExistError',
  message: ErEnum.DISK_REMOTE_BRANCH_IS_NOT_EXIST
}) {}
