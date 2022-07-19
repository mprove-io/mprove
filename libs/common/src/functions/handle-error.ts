import { enums } from '~common/barrels/enums';
import { logToConsole } from './log-to-console';
import { wrapError } from './wrap-error';

export function handleError(e: any, logIsColor?: enums.BoolEnum) {
  let wrappedError = wrapError(e);
  logToConsole(wrappedError, logIsColor);
  return;
}
