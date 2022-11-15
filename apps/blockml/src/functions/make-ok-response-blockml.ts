import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { interfaces } from '~blockml/barrels/interfaces';
import { nodeCommon } from '~blockml/barrels/node-common';

export function makeOkResponseBlockml(item: {
  body: any;
  payload: any;
  path: any;
  method: any;
  duration: number;
  skipLog?: boolean;
  cs: ConfigService<interfaces.Config>;
  logger: Logger;
}) {
  let { payload, body, path, method, duration, skipLog, cs, logger } = item;

  return nodeCommon.makeOkResponse({
    body: body,
    payload: payload,
    path: path,
    method: method,
    duration: duration,
    skipLog: skipLog,
    logResponseOk: common.enumToBoolean(
      cs.get<interfaces.Config['blockmlLogResponseOk']>('blockmlLogResponseOk')
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
