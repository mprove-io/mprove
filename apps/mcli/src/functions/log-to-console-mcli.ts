import { common } from '~mcli/barrels/common';
import { nodeCommon } from '~mcli/barrels/node-common';
import { CustomContext } from '~mcli/models/custom-command';

export function logToConsoleMcli(item: {
  log: any;
  logLevel: common.LogLevelEnum;
  context: CustomContext;
  isStringify?: boolean;
}) {
  let { log, logLevel, context, isStringify } = item;

  if (
    log instanceof Error ||
    (common.isDefined(log) &&
      common.isDefined(log.stack) &&
      common.isDefined(log.message))
  ) {
    log = { error: nodeCommon.wrapError(log) };
  }

  if (isStringify === true) {
    log = `${JSON.stringify(log, null, 2)}\n`;
  }

  if (logLevel === common.LogLevelEnum.Error) {
    context.stderr.write(log);
  } else {
    context.stdout.write(log);
  }
}
