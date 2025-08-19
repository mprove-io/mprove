import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getConfig } from '~backend/config/get.config';

export function logToConsoleBackend(item: {
  log: any;
  logger: Logger;
  logLevel: LogLevelEnum;
  cs: ConfigService;
}) {
  let { log, logger, logLevel, cs } = item;

  let logIsJson: BoolEnum;

  if (isDefined(cs)) {
    logIsJson = cs.get<BackendConfig['backendLogIsJson']>('backendLogIsJson');
  } else {
    let config = getConfig();
    logIsJson = config.backendLogIsJson;
  }

  logToConsole({
    log: log,
    logIsJson: enumToBoolean(logIsJson),
    logger: logger,
    logLevel: logLevel
  });
}
