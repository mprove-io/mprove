import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { interfaces } from '~blockml/barrels/interfaces';

export function makeErrorResponseBlockml(item: {
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
      cs.get<interfaces.Config['blockmlLogResponseError']>(
        'blockmlLogResponseError'
      )
    ),
    logOnResponser: common.enumToBoolean(
      cs.get<interfaces.Config['blockmlLogOnResponser']>(
        'blockmlLogOnResponser'
      )
    ),
    logIsColor: common.enumToBoolean(
      cs.get<interfaces.Config['blockmlLogIsColor']>('blockmlLogIsColor')
    ),
    logIsStringify: common.enumToBoolean(
      cs.get<interfaces.Config['blockmlLogIsStringify']>(
        'blockmlLogIsStringify'
      )
    )
  });
}
