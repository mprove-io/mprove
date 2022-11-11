import { common } from '~backend/barrels/common';
import { logToConsoleBackend } from './log-to-console-backend';

export function handleErrorBackend(e: any) {
  let wrappedError = common.wrapError(e);
  logToConsoleBackend(wrappedError);
  return;
}
