import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BackendConfig } from '~backend/config/backend-config';
import { getConfig } from '~backend/config/get.config';
import { BoolEnum } from '~common/enums/bool.enum';
import { BackendEnvEnum } from '~common/enums/env/backend-env.enum';
import { LogLevelEnum } from '~common/enums/log-level.enum';
import { enumToBoolean } from '~common/functions/enum-to-boolean';
import { isDefined } from '~common/functions/is-defined';
import { logToConsole } from '~node-common/functions/log-to-console';

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
    logLevel: logLevel,
    useLoggerOnlyForErrorLevel:
      cs.get<BackendConfig['backendEnv']>('backendEnv') !== BackendEnvEnum.PROD
  });
}
