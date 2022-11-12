import { PinoLogger } from 'nestjs-pino';
import { common } from '~blockml/barrels/common';
import { getLogOptionsBlockml } from './get-log-options-blockml';

export function logToConsoleBlockml(item: {
  log: any;
  pinoLogger: PinoLogger;
  logLevel: common.LogLevelEnum;
}) {
  let { log, pinoLogger, logLevel } = item;
  let { logIsColor, logIsStringify } = getLogOptionsBlockml();

  common.logToConsole({
    log: log,
    logIsColor: common.enumToBoolean(logIsColor),
    logIsStringify: common.enumToBoolean(logIsStringify),
    pinoLogger: pinoLogger,
    logLevel: logLevel
  });
}
