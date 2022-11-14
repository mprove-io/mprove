import { PinoLogger } from 'nestjs-pino';
import { common } from '~backend/barrels/common';
import { getConfig } from '~backend/config/get.config';

export function logToConsoleBackend(item: {
  log: any;
  pinoLogger: PinoLogger;
  logLevel: common.LogLevelEnum;
}) {
  let { log, pinoLogger, logLevel } = item;

  let config = getConfig();

  common.logToConsole({
    log: log,
    logIsStringify: common.enumToBoolean(config.backendLogIsStringify),
    logger: pinoLogger,
    logLevel: logLevel
  });
}
