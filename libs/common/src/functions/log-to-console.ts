import { PinoLogger } from 'nestjs-pino';
import * as util from 'util';
import { enums } from '~common/barrels/enums';
import { isDefined } from './is-defined';

export function logToConsole(item: {
  log: any;
  logLevel: enums.LogLevelEnum;
  pinoLogger: PinoLogger;
  logIsColor: boolean;
  logIsStringify: boolean;
}) {
  let { log, logIsColor, logIsStringify, pinoLogger, logLevel } = item;

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
    // let lg = util.inspect(message, false, null, isColor);
    console.log(
      util.inspect(log, {
        showHidden: false,
        depth: null,
        colors: logIsColor,
        breakLength: Infinity,
        compact: false
      })
    );
  }
}
