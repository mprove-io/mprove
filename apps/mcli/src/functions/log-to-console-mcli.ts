import { BaseContext } from 'clipanion';
import * as util from 'util';
import { common } from '~mcli/barrels/common';
import { nodeCommon } from '~mcli/barrels/node-common';

export function logToConsoleMcli(item: {
  log: any;
  logLevel: common.LogLevelEnum;
  context: BaseContext;
  isJson: boolean;
  isInspect?: boolean;
}) {
  let { log, logLevel, context, isJson, isInspect } = item;

  isInspect = common.isDefined(isInspect) ? isInspect : true;

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
  } else if (isInspect === true) {
    log = util.inspect(log, {
      showHidden: false,
      depth: null,
      colors: true,
      breakLength: Infinity,
      compact: false
    });
  }

  log = `${log}\n`;

  if (logLevel === common.LogLevelEnum.Error) {
    context.stderr.write(log);
  } else {
    context.stdout.write(log);
  }
}
