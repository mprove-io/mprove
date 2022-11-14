import { Logger } from '@nestjs/common';
import { common } from '~backend/barrels/common';
import { getConfig } from '~backend/config/get.config';

export function logToConsoleBackend(item: {
  log: any;
  logger: Logger;
  logLevel: common.LogLevelEnum;
}) {
  let { log, logger, logLevel } = item;

  let config = getConfig();

  common.logToConsole({
    log: log,
    logIsStringify: common.enumToBoolean(config.backendLogIsStringify),
    logger: logger,
    logLevel: logLevel
  });
}
