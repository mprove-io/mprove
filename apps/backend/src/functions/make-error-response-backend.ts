import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { common } from '~backend/barrels/common';
import { interfaces } from '~backend/barrels/interfaces';
import { nodeCommon } from '~backend/barrels/node-common';

export function makeErrorResponseBackend(item: {
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
      cs.get<interfaces.Config['backendLogResponseError']>(
        'backendLogResponseError'
      )
    ),
    logOnResponser: common.enumToBoolean(
      cs.get<interfaces.Config['backendLogOnResponser']>(
        'backendLogOnResponser'
      )
    ),
    logIsJson: common.enumToBoolean(
      cs.get<interfaces.Config['backendLogIsJson']>('backendLogIsJson')
    ),
    logger: logger
  });
}