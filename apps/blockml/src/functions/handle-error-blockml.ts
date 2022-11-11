import { common } from '~blockml/barrels/common';
import { logToConsoleBlockml } from './log-to-console-blockml';

export function handleErrorBlockml(e: any) {
  let wrappedError = common.wrapError(e);
  logToConsoleBlockml(wrappedError);
  return;
}
