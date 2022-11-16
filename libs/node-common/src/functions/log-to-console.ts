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
    let logSorted = getLogSorted(log);

    if (logLevel === enums.LogLevelEnum.Error) {
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
