import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { common } from '~backend/barrels/common';
import { interfaces } from '~backend/barrels/interfaces';
import { nodeCommon } from '~backend/barrels/node-common';
import { getConfig } from '~backend/config/get.config';

export function logToConsoleBackend(item: {
  log: any;
  logger: Logger;
  logLevel: common.LogLevelEnum;
  cs: ConfigService;
}) {
  let { log, logger, logLevel, cs } = item;

  let logIsJson: common.BoolEnum;

  if (common.isDefined(cs)) {
    logIsJson =
      cs.get<interfaces.Config['backendLogIsJson']>('backendLogIsJson');
  } else {
    let config = getConfig();
    logIsJson = config.backendLogIsJson;
  }

  nodeCommon.logToConsole({
    log: log,
    logIsJson: common.enumToBoolean(logIsJson),
    logger: logger,
    logLevel: logLevel
  });
}
