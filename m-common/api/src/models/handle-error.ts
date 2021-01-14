import * as apiEnums from '../enums/_index';
import { logToConsole } from './log-to-console';
import { wrapError } from './wrap-error';

export function handleError(e: any) {
  let wrappedError = wrapError(e);
  logToConsole(wrappedError);
  return;
}
