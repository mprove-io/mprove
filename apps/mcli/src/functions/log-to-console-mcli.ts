import { BaseContext } from 'clipanion';
import { common } from '~mcli/barrels/common';
import { nodeCommon } from '~mcli/barrels/node-common';
let prettyjson = require('prettyjson');

export function logToConsoleMcli(item: {
  log: any;
  logLevel: common.LogLevelEnum;
  context: BaseContext;
  isJson: boolean;
  isPretty?: boolean;
}) {
  let { log, logLevel, context, isJson, isPretty } = item;

  isPretty = common.isDefined(isPretty) ? isPretty : true;

  if (
    log instanceof Error ||
    (common.isDefined(log) &&
      common.isDefined(log.stack) &&
      common.isDefined(log.message))
  ) {
    log = { error: nodeCommon.wrapError(log) };
  }

  if (isJson === true) {
    log = JSON.stringify(log, null, 2);
  } else if (isPretty === true) {
    log = prettyjson.render(log, {
      keysColor: 'green',
      dashColor: 'magenta',
      stringColor: 'white',
      numberColor: 'yellow',
      multilineStringColor: 'cyan'
    });

    // log = util.inspect(log, {
    //   showHidden: false,
    //   depth: null,
    //   colors: true,
    //   breakLength: Infinity,
    //   compact: true
    // });
  }

  log = `${log}\n`;

  if (common.isUndefined(context)) {
    console.log(log);
  } else {
    if (logLevel === common.LogLevelEnum.Error) {
      context.stderr.write(log);
    } else {
      context.stdout.write(log);
    }
  }
}
