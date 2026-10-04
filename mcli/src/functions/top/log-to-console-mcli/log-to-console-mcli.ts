import { BaseContext } from 'clipanion';
import prettyjson from 'prettyjson';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { LogLevel } from '#common/types/node-common/logging/log-level';
import { wrapError } from '#node-common/functions/wrap-error/wrap-error';

export function logToConsoleMcli(item: {
  log: any;
  logLevel: LogLevel;
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
    if (logLevel === 'Error') {
      context.stderr.write(log);
    } else {
      context.stdout.write(log);
    }
  }
}
