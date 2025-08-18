import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { common } from '~disk/barrels/common';
import { nodeCommon } from '~disk/barrels/node-common';
import { Config } from '~disk/interfaces/config';

export function makeOkResponseDisk(item: {
  body: any;
  payload: any;
  path: any;
  method: any;
  duration: number;
  skipLog?: boolean;
  cs: ConfigService<Config>;
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
      cs.get<Config['diskLogResponseOk']>('diskLogResponseOk')
    ),
    logIsJson: common.enumToBoolean(
      cs.get<Config['diskLogIsJson']>('diskLogIsJson')
    ),
    logger: logger
  });
}
