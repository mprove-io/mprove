import { PinoLogger } from 'nestjs-pino';
import { common } from '~disk/barrels/common';
import { getLogOptionsDisk } from './get-log-options-disk';

export function logToConsoleDisk(item: {
  log: any;
  pinoLogger: PinoLogger;
  logLevel: common.LogLevelEnum;
}) {
  let { log, pinoLogger, logLevel } = item;
  let { logIsColor, logIsStringify } = getLogOptionsDisk();

  common.logToConsole({
    log: log,
    logIsColor: common.enumToBoolean(logIsColor),
    logIsStringify: common.enumToBoolean(logIsStringify),
    pinoLogger: pinoLogger,
    logLevel: logLevel
  });
}
