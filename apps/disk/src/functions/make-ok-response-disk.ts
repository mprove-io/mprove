import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { enumToBoolean } from '~common/functions/enum-to-boolean';
import { DiskConfig } from '~disk/config/disk-config';
import { makeOkResponse } from '~node-common/functions/make-ok-response';

export function makeOkResponseDisk(item: {
  body: any;
  payload: any;
  path: any;
  method: any;
  duration: number;
  cs: ConfigService<DiskConfig>;
  logger: Logger;
}) {
  let { payload, body, path, method, duration, cs, logger } = item;

  return makeOkResponse({
    body: body,
    payload: payload,
    path: path,
    method: method,
    duration: duration,
    isBackend: false,
    logResponseOk: enumToBoolean(
      cs.get<DiskConfig['diskLogResponseOk']>('diskLogResponseOk')
    ),
    logIsJson: enumToBoolean(
      cs.get<DiskConfig['diskLogIsJson']>('diskLogIsJson')
    ),
    logger: logger
  });
}
