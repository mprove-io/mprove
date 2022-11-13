import { PinoLogger } from 'nestjs-pino';
import { common } from '~disk/barrels/common';
import { getConfig } from '~disk/config/get.config';

export function logToConsoleDisk(item: {
  log: any;
  pinoLogger: PinoLogger;
  logLevel: common.LogLevelEnum;
}) {
  let { log, pinoLogger, logLevel } = item;

  let config = getConfig();

  common.logToConsole({
    log: log,
    logIsStringify: common.enumToBoolean(config.diskLogIsStringify),
    pinoLogger: pinoLogger,
    logLevel: logLevel
  });
}
