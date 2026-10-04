import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BackendConfig } from '#backend/config/backend-config';
import { getConfig } from '#backend/config/get.config';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { BackendEnv } from '#common/types/node-common/env/backend-env';
import type { LogLevel } from '#common/types/node-common/logging/log-level';
import { logToConsole } from '#node-common/functions/log-to-console/log-to-console';

export function logToConsoleBackend(item: {
  log: any;
  logger: Logger;
  logLevel: LogLevel;
  cs: ConfigService;
}) {
  let { log, logger, logLevel, cs } = item;

  let logIsJson: boolean;
  let backendEnv: BackendEnv;

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
    useLoggerOnlyForErrorLevel: backendEnv !== 'PROD'
  });
}
