import { Logger } from '@nestjs/common';
import { common } from '~disk/barrels/common';
import { getConfig } from '~disk/config/get.config';

export function logToConsoleDisk(item: {
  log: any;
  logger: Logger;
  logLevel: common.LogLevelEnum;
}) {
  let { log, logger, logLevel } = item;

  let config = getConfig();

  common.logToConsole({
    log: log,
    logIsJson: common.enumToBoolean(config.diskLogIsJson),
    logLevel: logLevel,
    logger: logger
  });
}
