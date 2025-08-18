import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { common } from '~disk/barrels/common';
import { nodeCommon } from '~disk/barrels/node-common';
import { Config } from '~disk/interfaces/config';

export function makeErrorResponseDisk(item: {
  body: any;
  e: any;
  path: any;
  method: any;
  duration: number;
  skipLog?: boolean;
  cs: ConfigService<Config>;
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
      cs.get<Config['diskLogResponseError']>('diskLogResponseError')
    ),
    logIsJson: common.enumToBoolean(
      cs.get<Config['diskLogIsJson']>('diskLogIsJson')
    ),
    logger: logger
  });
}
