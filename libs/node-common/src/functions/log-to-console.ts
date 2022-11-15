import { Logger } from '@nestjs/common';
// import { hostname } from 'os';
import * as util from 'util';
import { enums } from '~common/barrels/enums';
import { common } from '~node-common/barrels/common';
import { wrapError } from './wrap-error';

export function logToConsole(item: {
  log: any;
  logLevel: enums.LogLevelEnum;
  logger: Logger;
  logIsJson: boolean;
}) {
  let { log, logIsJson, logger, logLevel } = item;

  if (
    log instanceof Error ||
    (common.isDefined(log) &&
      common.isDefined(log.stack) &&
      common.isDefined(log.message))
  ) {
    log = { error: wrapError(log) };
  }

  if (log.constructor !== Object) {
    log = { message: log };
  }

  // log = Object.assign(log, {
  //   pid: process.pid,
  //   hostname: hostname()
  // });

  if (common.isDefined(logger)) {
    if (logLevel === enums.LogLevelEnum.Error) {
      logger.error(log);
    } else {
      logger.log(log);
    }
  } else {
    // no logger
    log = Object.assign(log, {
      level: logLevel.toLowerCase(),
      timestamp: new Date().toISOString()
    });

    if (logIsJson === true) {
      console.log(JSON.stringify(log));
    } else {
      console.log(
        util.inspect(log, {
          showHidden: false,
          depth: null,
          colors: true,
          breakLength: Infinity,
          compact: false
        })
      );
    }
  }
}
