import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { common } from '~disk/barrels/common';
import { interfaces } from '~disk/barrels/interfaces';
import { nodeCommon } from '~disk/barrels/node-common';

export function makeErrorResponseDisk(item: {
  e: any;
  body: any;
  request?: any;
  path?: any;
  method?: any;
  duration?: number;
  skipLog?: boolean;
  cs: ConfigService<interfaces.Config>;
  logger: Logger;
}) {
  let { e, body, cs, request, path, method, duration, skipLog, logger } = item;

  return nodeCommon.makeErrorResponse({
    e: e,
    body: body,
    request: request,
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
