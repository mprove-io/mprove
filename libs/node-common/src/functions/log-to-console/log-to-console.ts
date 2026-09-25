// import { hostname } from 'os';

import { Logger } from '@nestjs/common';
import * as util from 'util';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { getLogSorted } from '#node-common/functions/log-to-console/get-log-sorted/get-log-sorted';
import { wrapError } from '#node-common/functions/wrap-error/wrap-error';

export function logToConsole(item: {
  log: any;
  logLevel: LogLevelEnum;
  logger: Logger;
  logIsJson: boolean;
  useLoggerOnlyForErrorLevel: boolean;
}) {
  let { log, logIsJson, logger, logLevel, useLoggerOnlyForErrorLevel } = item;

  if (
    log instanceof Error ||
    (isDefined(log) && isDefined(log.stack) && isDefined(log.message))
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

  if (
    isDefined(logger) &&
    (logLevel === LogLevelEnum.Error || useLoggerOnlyForErrorLevel === false)
  ) {
    let logSorted: any = getLogSorted({ log: log });

    if (logLevel === LogLevelEnum.Error) {
      logger.error(logSorted);
    } else {
      logger.log(logSorted);
    }
  } else {
    // no logger
    log = Object.assign(log, {
      level: logLevel.toLowerCase(),
      timestamp: new Date().toISOString()
    });

    let logSorted: any = getLogSorted({ log: log });

    if (logIsJson === true) {
      console.log(JSON.stringify(logSorted));
    } else {
      console.log(
        util.inspect(logSorted, {
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
