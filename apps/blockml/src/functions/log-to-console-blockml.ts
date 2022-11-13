import { PinoLogger } from 'nestjs-pino';
import { common } from '~blockml/barrels/common';
import { getConfig } from '~blockml/config/get.config';

export function logToConsoleBlockml(item: {
  log: any;
  pinoLogger: PinoLogger;
  logLevel: common.LogLevelEnum;
}) {
  let { log, pinoLogger, logLevel } = item;

  let config = getConfig();

  common.logToConsole({
    log: log,
    logIsStringify: common.enumToBoolean(config.blockmlLogIsStringify),
    pinoLogger: pinoLogger,
    logLevel: logLevel
  });
}
