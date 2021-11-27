import { ConfigService } from '@nestjs/config';
import { enums } from '~common/barrels/enums';
import { Config, MyResponse } from '~common/interfaces/_index';
import { logToConsole } from './log-to-console';

export function makeOkResponse(item: {
  request?: any;
  path?: any;
  method?: any;
  duration?: number;
  body: any;
  payload: any;
  cs: ConfigService<Config>;
  skipLog?: boolean;
}) {
  let { body, payload, cs, request, path, method, duration, skipLog } = item;

  let response: MyResponse = {
    info: {
      path: request?.url || path,
      method: request?.method || method,
      duration: duration,
      traceId: body.info?.traceId,
      status: enums.ResponseInfoStatusEnum.Ok
    },
    payload: payload
  };

  if (
    cs.get<Config['mproveLogOnResponser']>('mproveLogOnResponser') ===
      enums.BoolEnum.TRUE &&
    cs.get<Config['mproveLogResponseOk']>('mproveLogResponseOk') ===
      enums.BoolEnum.TRUE &&
    skipLog !== true
  ) {
    let part = Object.assign({}, response, { payload: undefined });
    logToConsole(part, cs);
  }

  return response;
}
