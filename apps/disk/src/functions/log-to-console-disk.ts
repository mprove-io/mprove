import { common } from '~disk/barrels/common';
import { getLogOptionsDisk } from './get-log-options-disk';

export function logToConsoleDisk(log: any) {
  let { logIsColor, logIsStringify } = getLogOptionsDisk();

  common.logToConsole({
    log: log,
    logIsColor: common.enumToBoolean(logIsColor),
    logIsStringify: common.enumToBoolean(logIsStringify)
  });
}
