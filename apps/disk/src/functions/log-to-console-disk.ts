import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { common } from '~disk/barrels/common';
import { nodeCommon } from '~disk/barrels/node-common';
import { getConfig } from '~disk/config/get.config';
import { Config } from '~disk/interfaces/config';

export function logToConsoleDisk(item: {
  log: any;
  logger: Logger;
  logLevel: common.LogLevelEnum;
  cs: ConfigService;
}) {
  let { log, logger, logLevel, cs } = item;

  let logIsJson: common.BoolEnum;

  if (common.isDefined(cs)) {
    logIsJson = cs.get<Config['diskLogIsJson']>('diskLogIsJson');
  } else {
    let config = getConfig();
    logIsJson = config.diskLogIsJson;
  }

  nodeCommon.logToConsole({
    log: log,
    logIsJson: common.enumToBoolean(logIsJson),
    logger: logger,
    logLevel: logLevel
  });
}
