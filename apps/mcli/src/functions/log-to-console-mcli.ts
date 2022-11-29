import { common } from '~mcli/barrels/common';
import { nodeCommon } from '~mcli/barrels/node-common';

export function logToConsoleMcli(item: {
  log: any;
  logLevel: common.LogLevelEnum;
}) {
  let { log, logLevel } = item;

  nodeCommon.logToConsole({
    log: log,
    logIsJson: false,
    logger: undefined,
    logLevel: logLevel
  });
}
