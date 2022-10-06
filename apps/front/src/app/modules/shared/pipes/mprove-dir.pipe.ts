import { Pipe, PipeTransform } from '@angular/core';
import { common } from '~front/barrels/common';

@Pipe({ name: 'mproveDir' })
// eslint-disable-next-line @angular-eslint/use-pipe-transform-interface
export class MproveDirPipe implements PipeTransform {
  transform(mdir: string) {
    if (common.isUndefined(mdir)) {
      return mdir;
    }

    if (
      (mdir.length > 2 || mdir.length === 2) && // === 2
      mdir.substring(0, 2) === common.MPROVE_CONFIG_DIR_DOT_SLASH
    ) {
      mdir = mdir.substring(2);
    }
    return mdir;
  }
}
