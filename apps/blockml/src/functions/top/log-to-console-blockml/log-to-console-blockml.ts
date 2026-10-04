import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BlockmlConfig } from '#blockml/config/blockml-config';
import { getConfig } from '#blockml/config/get.config';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { BlockmlEnv } from '#common/types/node-common/env/blockml-env';
import type { LogLevel } from '#common/types/node-common/logging/log-level';
import { logToConsole } from '#node-common/functions/log-to-console/log-to-console';

export function logToConsoleBlockml(item: {
  log: any;
  logger: Logger;
  logLevel: LogLevel;
  cs: ConfigService;
}) {
  let { log, logger, logLevel, cs } = item;

  let logIsJson: boolean;
  let blockmlEnv: BlockmlEnv;

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
    logIsJson: logIsJson,
    logger: logger,
    logLevel: logLevel,
    useLoggerOnlyForErrorLevel: blockmlEnv !== 'PROD'
  });
}
