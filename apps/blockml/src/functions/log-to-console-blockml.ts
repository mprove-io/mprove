import { common } from '~blockml/barrels/common';
import { getLogOptionsBlockml } from './get-log-options-blockml';

export function logToConsoleBlockml(log: any) {
  let { logIsColor, logIsStringify } = getLogOptionsBlockml();

  common.logToConsole({
    log: log,
    logIsColor: common.enumToBoolean(logIsColor),
    logIsStringify: common.enumToBoolean(logIsStringify)
  });
}
