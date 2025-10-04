import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BlockmlConfig } from '~blockml/config/blockml-config';
import { getConfig } from '~blockml/config/get.config';
import { BoolEnum } from '~common/enums/bool.enum';
import { BlockmlEnvEnum } from '~common/enums/env/blockml-env.enum';
import { LogLevelEnum } from '~common/enums/log-level.enum';
import { enumToBoolean } from '~common/functions/enum-to-boolean';
import { isDefined } from '~common/functions/is-defined';
import { logToConsole } from '~node-common/functions/log-to-console';

export function logToConsoleBlockml(item: {
  log: any;
  logger: Logger;
  logLevel: LogLevelEnum;
  cs: ConfigService;
}) {
  let { log, logger, logLevel, cs } = item;

  let logIsJson: BoolEnum;
  let blockmlEnv: BlockmlEnvEnum;

  if (isDefined(cs)) {
    logIsJson = cs.get<BlockmlConfig['blockmlLogIsJson']>('blockmlLogIsJson');
    blockmlEnv = cs.get<BlockmlConfig['blockmlEnv']>('blockmlEnv');
  } else {
    let config = getConfig();
    logIsJson = config.blockmlLogIsJson;
    blockmlEnv = config.blockmlEnv;
  }

  logToConsole({
    log: log,
    logIsJson: enumToBoolean(logIsJson),
    logger: logger,
    logLevel: logLevel,
    useLoggerOnlyForErrorLevel: blockmlEnv !== BlockmlEnvEnum.PROD
  });
}
