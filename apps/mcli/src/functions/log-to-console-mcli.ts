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
    logIsJson: common.isDefined(config?.mproveCliLogIsJson)
      ? common.enumToBoolean(config.mproveCliLogIsJson)
      : false,
    logger: undefined,
    logLevel: logLevel
  });
}
