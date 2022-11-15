import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { common } from '~disk/barrels/common';
import { interfaces } from '~disk/barrels/interfaces';
import { nodeCommon } from '~disk/barrels/node-common';

export function makeErrorResponseDisk(item: {
  body: any;
  e: any;
  path: any;
  method: any;
  duration: number;
  skipLog?: boolean;
  cs: ConfigService<interfaces.Config>;
  logger: Logger;
}) {
  let { e, body, cs, path, method, duration, skipLog, logger } = item;

  return nodeCommon.makeErrorResponse({
    body: body,
    e: e,
    path: path,
    method: method,
    duration: duration,
    skipLog: skipLog,
    logResponseError: common.enumToBoolean(
      cs.get<interfaces.Config['diskLogResponseError']>('diskLogResponseError')
    ),
    logOnResponser: common.enumToBoolean(
      cs.get<interfaces.Config['diskLogOnResponser']>('diskLogOnResponser')
    ),
    logIsJson: common.enumToBoolean(
      cs.get<interfaces.Config['diskLogIsJson']>('diskLogIsJson')
    ),
    logger: logger
  });
}
