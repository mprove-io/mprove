import { ErrorFactory } from '@praha/error-factory';
import { ErEnum } from '#common/enums/er.enum';

export class DiskRepoStatusIsNotNeedPushError extends ErrorFactory({
  name: 'DiskRepoStatusIsNotNeedPushError',
  message: ErEnum.DISK_REPO_STATUS_IS_NOT_NEED_PUSH
}) {}
