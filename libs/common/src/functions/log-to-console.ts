import { PinoLogger } from 'nestjs-pino';
import * as util from 'util';
import { enums } from '~common/barrels/enums';
import { isDefined } from './is-defined';
import { wrapError } from './wrap-error';

export function logToConsole(item: {
  log: any;
  logLevel: enums.LogLevelEnum;
  pinoLogger: PinoLogger;
  logIsStringify: boolean;
}) {
  let { log, logIsStringify, pinoLogger, logLevel } = item;

  if (
    log instanceof Error ||
    (isDefined(log) && isDefined(log.stack) && isDefined(log.message))
  ) {
    log = wrapError(log);
  }

  if (isDefined(pinoLogger)) {
    if (logLevel === enums.LogLevelEnum.Fatal) {
      pinoLogger.fatal(log);
    } else if (logLevel === enums.LogLevelEnum.Error) {
      pinoLogger.error(log);
    } else if (logLevel === enums.LogLevelEnum.Warn) {
      pinoLogger.warn(log);
    } else {
      pinoLogger.info(log);
    }
  } else if (logIsStringify === true) {
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
