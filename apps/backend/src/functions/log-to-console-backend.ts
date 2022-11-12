import { PinoLogger } from 'nestjs-pino';
import { common } from '~backend/barrels/common';
import { getLogOptionsBackend } from './get-log-options-backend';

export function logToConsoleBackend(item: {
  log: any;
  pinoLogger: PinoLogger;
  logLevel: common.LogLevelEnum;
}) {
  let { log, pinoLogger, logLevel } = item;
  let { logIsColor, logIsStringify } = getLogOptionsBackend();

  common.logToConsole({
    log: log,
    logIsColor: common.enumToBoolean(logIsColor),
    logIsStringify: common.enumToBoolean(logIsStringify),
    pinoLogger: pinoLogger,
    logLevel: logLevel
  });
}
