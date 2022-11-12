import { ConfigService } from '@nestjs/config';
import { PinoLogger } from 'nestjs-pino';
import { common } from '~disk/barrels/common';
import { interfaces } from '~disk/barrels/interfaces';

export function makeErrorResponseDisk(item: {
  e: any;
  body: any;
  request?: any;
  path?: any;
  method?: any;
  duration?: number;
  skipLog?: boolean;
  cs: ConfigService<interfaces.Config>;
  pinoLogger: PinoLogger;
}) {
  let { e, body, cs, request, path, method, duration, skipLog, pinoLogger } =
    item;

  return common.makeErrorResponse({
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
    logIsColor: common.enumToBoolean(
      cs.get<interfaces.Config['diskLogIsColor']>('diskLogIsColor')
    ),
    logIsStringify: common.enumToBoolean(
      cs.get<interfaces.Config['diskLogIsStringify']>('diskLogIsStringify')
    ),
    pinoLogger: pinoLogger
  });
}
