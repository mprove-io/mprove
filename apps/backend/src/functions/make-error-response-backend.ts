import { ConfigService } from '@nestjs/config';
import { common } from '~backend/barrels/common';
import { interfaces } from '~backend/barrels/interfaces';

export function makeErrorResponseBackend(item: {
  e: any;
  body: any;
  request?: any;
  path?: any;
  method?: any;
  duration?: number;
  skipLog?: boolean;
  cs: ConfigService<interfaces.Config>;
}) {
  let { e, body, cs, request, path, method, duration, skipLog } = item;

  return common.makeErrorResponse({
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
    logIsColor: common.enumToBoolean(
      cs.get<interfaces.Config['backendLogIsColor']>('backendLogIsColor')
    ),
    logIsStringify: common.enumToBoolean(
      cs.get<interfaces.Config['backendLogIsStringify']>(
        'backendLogIsStringify'
      )
    )
  });
}
