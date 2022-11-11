import { ConfigService } from '@nestjs/config';
import { common } from '~disk/barrels/common';
import { interfaces } from '~disk/barrels/interfaces';

export function makeOkResponseDisk(item: {
  payload: any;
  body: any;
  request?: any;
  path?: any;
  method?: any;
  duration?: number;
  skipLog?: boolean;
  cs: ConfigService<interfaces.Config>;
}) {
  let { payload, body, request, path, method, duration, skipLog, cs } = item;

  return common.makeOkResponse({
    payload: payload,
    body: body,
    request: request,
    path: path,
    method: method,
    duration: duration,
    skipLog: skipLog,
    logResponseOk: common.enumToBoolean(
      cs.get<interfaces.Config['diskLogResponseOk']>('diskLogResponseOk')
    ),
    logOnResponser: common.enumToBoolean(
      cs.get<interfaces.Config['diskLogOnResponser']>('diskLogOnResponser')
    ),
    logIsColor: common.enumToBoolean(
      cs.get<interfaces.Config['diskLogIsColor']>('diskLogIsColor')
    ),
    logIsStringify: common.enumToBoolean(
      cs.get<interfaces.Config['diskLogIsStringify']>('diskLogIsStringify')
    )
  });
}
