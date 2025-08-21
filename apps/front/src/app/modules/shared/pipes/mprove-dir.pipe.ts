import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ standalone: false, name: 'mproveDir' })
export class MproveDirPipe implements PipeTransform {
  transform(mdir: string) {
    if (isUndefined(mdir)) {
      return mdir;
    }

    if (
      (mdir.length > 2 || mdir.length === 2) && // === 2
      mdir.substring(0, 2) === MPROVE_CONFIG_DIR_DOT_SLASH
    ) {
      mdir = mdir.substring(2);
    }
    return mdir;
  }
}
