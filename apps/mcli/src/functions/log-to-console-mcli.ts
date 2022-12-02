import { common } from '~mcli/barrels/common';
import { interfaces } from '~mcli/barrels/interfaces';
import { nodeCommon } from '~mcli/barrels/node-common';

export function logToConsoleMcli(item: {
  log: any;
  logLevel: common.LogLevelEnum;
  config: interfaces.Config;
}) {
  let { log, logLevel, config } = item;

  nodeCommon.logToConsole({
    log: log,
    logIsJson: common.enumToBoolean(config.mproveCliLogIsJson),
    logger: undefined,
    logLevel: logLevel
  });
}
