import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { DiskEnv } from '#common/types/node-common/env/disk-env';
import type { LogLevel } from '#common/types/node-common/logging/log-level';
import type { DiskConfig } from '#disk/config/disk-config';
import { getConfig } from '#disk/config/get.config';
import { logToConsole } from '#node-common/functions/log-to-console/log-to-console';

export function logToConsoleDisk(item: {
  log: any;
  logger: Logger;
  logLevel: LogLevel;
  cs: ConfigService;
}) {
  let { log, logger, logLevel, cs } = item;

  let logIsJson: boolean;
  let diskEnv: DiskEnv;

  if (isDefined(cs)) {
    logIsJson = cs.get<DiskConfig['diskLogIsJson']>('diskLogIsJson');
    diskEnv = cs.get<DiskConfig['diskEnv']>('diskEnv');
  } else {
    let config = getConfig();
    logIsJson = config.diskLogIsJson;
    diskEnv = config.diskEnv;
  }

  logToConsole({
    log: log,
    logIsJson: logIsJson,
    logger: logger,
    logLevel: logLevel,
    useLoggerOnlyForErrorLevel: diskEnv !== 'PROD'
  });
}
