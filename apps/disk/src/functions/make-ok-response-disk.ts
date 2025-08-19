import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { enumToBoolean } from '~common/functions/enum-to-boolean';
import { DiskConfig } from '~common/interfaces/disk/disk-config';
import { makeOkResponse } from '~node-common/functions/make-ok-response';

export function makeOkResponseDisk(item: {
  body: any;
  payload: any;
  path: any;
  method: any;
  duration: number;
  skipLog?: boolean;
  cs: ConfigService<DiskConfig>;
  logger: Logger;
}) {
  let { payload, body, path, method, duration, skipLog, cs, logger } = item;

  return makeOkResponse({
    body: body,
    payload: payload,
    path: path,
    method: method,
    duration: duration,
    skipLog: skipLog,
    logResponseOk: enumToBoolean(
      cs.get<DiskConfig['diskLogResponseOk']>('diskLogResponseOk')
    ),
    logIsJson: enumToBoolean(
      cs.get<DiskConfig['diskLogIsJson']>('diskLogIsJson')
    ),
    logger: logger
  });
}
