import { common } from '~backend/barrels/common';
import { getLogOptionsBackend } from './get-log-options-backend';

export function logToConsoleBackend(log: any) {
  let { logIsColor, logIsStringify } = getLogOptionsBackend();

  common.logToConsole({
    log: log,
    logIsColor: common.enumToBoolean(logIsColor),
    logIsStringify: common.enumToBoolean(logIsStringify)
  });
}
