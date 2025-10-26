import { BaseContext } from 'clipanion';
import { LogLevelEnum } from '~common/enums/log-level.enum';
import { isDefined } from '~common/functions/is-defined';
import { isUndefined } from '~common/functions/is-undefined';
import { wrapError } from '~node-common/functions/wrap-error';

let prettyjson = require('prettyjson');

export function logToConsoleMcli(item: {
  log: any;
  logLevel: LogLevelEnum;
  context: BaseContext;
  isJson: boolean;
  isPretty?: boolean;
}) {
  let { log, logLevel, context, isJson, isPretty } = item;

  isPretty = isDefined(isPretty) ? isPretty : true;

  if (
    log instanceof Error ||
    (isDefined(log) && isDefined(log.stack) && isDefined(log.message))
  ) {
    log = { error: wrapError(log) };
  }

  if (isJson === true) {
    log = JSON.stringify(log, null, 2);
  } else if (isPretty === true) {
    log = prettyjson.render(log, {
      keysColor: 'white',
      dashColor: 'gray',
      stringColor: 'green',
      numberColor: 'yellow',
      multilineStringColor: 'cyan'
    });
  }

  log = `${log}\n`;

  if (isUndefined(context)) {
    console.log(log);
  } else {
    if (logLevel === LogLevelEnum.Error) {
      context.stderr.write(log);
    } else {
      context.stdout.write(log);
    }
  }
}
