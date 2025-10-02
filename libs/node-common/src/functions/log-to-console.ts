// import { hostname } from 'os';
import * as util from 'util';
import { Logger } from '@nestjs/common';
import { LogLevelEnum } from '~common/enums/log-level.enum';
import { isDefined } from '~common/functions/is-defined';
import { wrapError } from './wrap-error';

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
    let logSorted = getLogSorted(log);

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

    let logSorted = getLogSorted(log);

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

function getLogSorted(log: any) {
  if (log.constructor !== Object) {
    return log;
  }

  if (log.response?.info?.constructor === Object) {
    let infoSorted = Object.keys(log.response.info)
      .sort()
      .reduce(function (ac: any, key) {
        ac[key] = log.response.info[key];
        return ac;
      }, {});

    log.response.info = infoSorted;
  }

  if (log.response?.constructor === Object) {
    let responseSorted = Object.keys(log.response)
      .sort()
      .reduce(function (ac: any, key) {
        ac[key] = log.response[key];
        return ac;
      }, {});

    log.response = responseSorted;
  }

  let logSorted = Object.keys(log)
    .sort()
    .reduce(function (ac: any, key) {
      ac[key] = log[key];
      return ac;
    }, {});

  return logSorted;
}
