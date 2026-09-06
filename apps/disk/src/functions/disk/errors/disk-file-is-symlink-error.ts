import { ErrorFactory } from '@praha/error-factory';
import { ErEnum } from '#common/enums/er.enum';

export class DiskFileIsSymlinkError extends ErrorFactory({
  name: 'DiskFileIsSymlinkError',
  message: ErEnum.FILE_IS_SYMLINK
}) {}
