import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BackendConfig } from '#backend/config/backend-config';
import { getConfig } from '#backend/config/get.config';
import { BackendEnvEnum } from '#common/enums/env/backend-env.enum';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { isDefined } from '#common/functions/is-defined';
import { logToConsole } from '#node-common/functions/log-to-console';

export function logToConsoleBackend(item: {
  log: any;
  logger: Logger;
  logLevel: LogLevelEnum;
  cs: ConfigService;
}) {
  let { log, logger, logLevel, cs } = item;

  let logIsJson: boolean;
  let backendEnv: BackendEnvEnum;

  if (isDefined(cs)) {
    logIsJson = cs.get<BackendConfig['backendLogIsJson']>('backendLogIsJson');
    backendEnv = cs.get<BackendConfig['backendEnv']>('backendEnv');
  } else {
    let config = getConfig();
    logIsJson = config.backendLogIsJson;
    backendEnv = config.backendEnv;
  }

  logToConsole({
    log: log,
    logIsJson: logIsJson,
    logger: logger,
    logLevel: logLevel,
    useLoggerOnlyForErrorLevel: backendEnv !== BackendEnvEnum.PROD
  });
}
