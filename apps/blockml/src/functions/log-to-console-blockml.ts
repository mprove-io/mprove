import { Logger } from '@nestjs/common';
import { common } from '~blockml/barrels/common';
import { getConfig } from '~blockml/config/get.config';

export function logToConsoleBlockml(item: {
  log: any;
  logger: Logger;
  logLevel: common.LogLevelEnum;
}) {
  let { log, logger, logLevel } = item;

  let config = getConfig();

  common.logToConsole({
    log: log,
    logIsStringify: common.enumToBoolean(config.blockmlLogIsStringify),
    logger: logger,
    logLevel: logLevel
  });
}
