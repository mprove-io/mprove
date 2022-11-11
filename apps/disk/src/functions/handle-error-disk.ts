import { common } from '~disk/barrels/common';
import { logToConsoleDisk } from './log-to-console-disk';

export function handleErrorDisk(e: any) {
  let wrappedError = common.wrapError(e);
  logToConsoleDisk(wrappedError);
  return;
}
