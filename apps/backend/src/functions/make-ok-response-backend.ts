import { ConfigService } from '@nestjs/config';
import { PinoLogger } from 'nestjs-pino';
import { common } from '~backend/barrels/common';
import { interfaces } from '~backend/barrels/interfaces';

export function makeOkResponseBackend(item: {
  payload: any;
  body: any;
  request?: any;
  path?: any;
  method?: any;
  duration?: number;
  skipLog?: boolean;
  cs: ConfigService<interfaces.Config>;
  pinoLogger: PinoLogger;
}) {
  let {
    payload,
    body,
    request,
    path,
    method,
    duration,
    skipLog,
    cs,
    pinoLogger
  } = item;

  return common.makeOkResponse({
    payload: payload,
    body: body,
    request: request,
    path: path,
    method: method,
    duration: duration,
    skipLog: skipLog,
    logResponseOk: common.enumToBoolean(
      cs.get<interfaces.Config['backendLogResponseOk']>('backendLogResponseOk')
    ),
    logOnResponser: common.enumToBoolean(
      cs.get<interfaces.Config['backendLogOnResponser']>(
        'backendLogOnResponser'
      )
    ),
    logIsStringify: common.enumToBoolean(
      cs.get<interfaces.Config['backendLogIsStringify']>(
        'backendLogIsStringify'
      )
    ),
    pinoLogger: pinoLogger
  });
}
