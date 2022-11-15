import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { interfaces } from '~blockml/barrels/interfaces';
import { nodeCommon } from '~blockml/barrels/node-common';

export function makeErrorResponseBlockml(item: {
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
      cs.get<interfaces.Config['blockmlLogResponseError']>(
        'blockmlLogResponseError'
      )
    ),
    logOnResponser: common.enumToBoolean(
      cs.get<interfaces.Config['blockmlLogOnResponser']>(
        'blockmlLogOnResponser'
      )
    ),
    logIsJson: common.enumToBoolean(
      cs.get<interfaces.Config['blockmlLogIsJson']>('blockmlLogIsJson')
    ),
    logger: logger
  });
}
