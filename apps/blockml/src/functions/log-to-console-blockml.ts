import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { interfaces } from '~blockml/barrels/interfaces';
import { getConfig } from '~blockml/config/get.config';

export function logToConsoleBlockml(item: {
  log: any;
  logger: Logger;
  logLevel: common.LogLevelEnum;
  cs: ConfigService;
}) {
  let { log, logger, logLevel, cs } = item;

  let logIsJson: common.BoolEnum;

  if (common.isDefined(cs)) {
    logIsJson =
      cs.get<interfaces.Config['blockmlLogIsJson']>('blockmlLogIsJson');
  } else {
    let config = getConfig();
    logIsJson = config.blockmlLogIsJson;
  }

  common.logToConsole({
    log: log,
    logIsJson: common.enumToBoolean(logIsJson),
    logger: logger,
    logLevel: logLevel
  });
}
