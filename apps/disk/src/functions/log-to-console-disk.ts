import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { common } from '~disk/barrels/common';
import { interfaces } from '~disk/barrels/interfaces';
import { getConfig } from '~disk/config/get.config';

export function logToConsoleDisk(item: {
  log: any;
  logger: Logger;
  logLevel: common.LogLevelEnum;
  cs: ConfigService;
}) {
  let { log, logger, logLevel, cs } = item;

  let logIsJson: common.BoolEnum;

  if (common.isDefined(cs)) {
    logIsJson = cs.get<interfaces.Config['diskLogIsJson']>('diskLogIsJson');
  } else {
    let config = getConfig();
    logIsJson = config.diskLogIsJson;
  }

  common.logToConsole({
    log: log,
    logIsJson: common.enumToBoolean(logIsJson),
    logger: logger,
    logLevel: logLevel
  });
}
