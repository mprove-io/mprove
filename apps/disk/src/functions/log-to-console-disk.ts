import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BoolEnum } from '~common/enums/bool.enum';
import { LogLevelEnum } from '~common/enums/log-level.enum';
import { enumToBoolean } from '~common/functions/enum-to-boolean';
import { isDefined } from '~common/functions/is-defined';
import { DiskConfig } from '~common/interfaces/disk/disk-config';
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

  if (isDefined(cs)) {
    logIsJson = cs.get<DiskConfig['diskLogIsJson']>('diskLogIsJson');
  } else {
    let config = getConfig();
    logIsJson = config.diskLogIsJson;
  }

  logToConsole({
    log: log,
    logIsJson: enumToBoolean(logIsJson),
    logger: logger,
    logLevel: logLevel
  });
}
