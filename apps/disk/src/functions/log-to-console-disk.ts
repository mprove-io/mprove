import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BoolEnum } from '~common/enums/bool.enum';
import { DiskEnvEnum } from '~common/enums/env/disk-env.enum';
import { LogLevelEnum } from '~common/enums/log-level.enum';
import { enumToBoolean } from '~common/functions/enum-to-boolean';
import { isDefined } from '~common/functions/is-defined';
import { DiskConfig } from '~disk/config/disk-config';
import { getConfig } from '~disk/config/get.config';
import { logToConsole } from '~node-common/functions/log-to-console';

export function logToConsoleDisk(item: {
  log: any;
  logger: Logger;
  logLevel: LogLevelEnum;
  cs: ConfigService;
}) {
  let { log, logger, logLevel, cs } = item;

  let logIsJson: BoolEnum;
  let diskEnv: DiskEnvEnum;

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
    logIsJson: enumToBoolean(logIsJson),
    logger: logger,
    logLevel: logLevel,
    useLoggerOnlyForErrorLevel: diskEnv !== DiskEnvEnum.PROD
  });
}
