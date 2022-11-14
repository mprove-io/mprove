import { Logger } from '@nestjs/common';
// import { hostname } from 'os';
import * as util from 'util';
import { enums } from '~common/barrels/enums';
import { isDefined } from './is-defined';
import { wrapError } from './wrap-error';

export function logToConsole(item: {
  log: any;
  logLevel: enums.LogLevelEnum;
  logger: Logger;
  logIsStringify: boolean;
}) {
  let { log, logIsStringify, logger, logLevel } = item;

  if (
    log instanceof Error ||
    (isDefined(log) && isDefined(log.stack) && isDefined(log.message))
  ) {
    log = wrapError(log);
  }

  if (isDefined(logger)) {
    if (logLevel === enums.LogLevelEnum.Error) {
      logger.error(log);
    } else {
      logger.log(log);
    }
  } else if (logIsStringify === true) {
    // let opts = {
    //   level: logLevel === enums.LogLevelEnum.Error ? 50 : 30,
    //   time: Math.floor(new Date().getTime()),
    //   pid: process.pid,
    //   hostname: hostname()
    // };

    // if (log.constructor === Object) {
    //   log = Object.assign(opts, log);
    // } else {
    //   log = Object.assign(opts, { log: log });
    // }

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
