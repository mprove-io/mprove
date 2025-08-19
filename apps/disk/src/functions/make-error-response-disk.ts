import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { enumToBoolean } from '~common/functions/enum-to-boolean';
import { DiskConfig } from '~common/interfaces/disk/disk-config';
import { makeErrorResponse } from '~node-common/functions/make-error-response';

export function makeErrorResponseDisk(item: {
  body: any;
  e: any;
  path: any;
  method: any;
  duration: number;
  skipLog?: boolean;
  cs: ConfigService<DiskConfig>;
  logger: Logger;
}) {
  let { e, body, cs, path, method, duration, skipLog, logger } = item;

  return makeErrorResponse({
    body: body,
    e: e,
    path: path,
    method: method,
    duration: duration,
    skipLog: skipLog,
    logResponseError: enumToBoolean(
      cs.get<DiskConfig['diskLogResponseError']>('diskLogResponseError')
    ),
    logIsJson: enumToBoolean(
      cs.get<DiskConfig['diskLogIsJson']>('diskLogIsJson')
    ),
    logger: logger
  });
}
