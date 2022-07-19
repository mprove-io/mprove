import { enums } from '~common/barrels/enums';
import { MyResponse } from '~common/interfaces/_index';
import { logToConsole } from './log-to-console';

export function makeOkResponse(item: {
  request?: any;
  path?: any;
  method?: any;
  duration?: number;
  body: any;
  payload: any;
  skipLog?: boolean;
  logResponseOk: enums.BoolEnum;
  logOnResponser: enums.BoolEnum;
  logIsColor: enums.BoolEnum;
}) {
  let {
    body,
    payload,
    request,
    path,
    method,
    duration,
    skipLog,
    logResponseOk,
    logOnResponser,
    logIsColor
  } = item;

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
    logOnResponser === enums.BoolEnum.TRUE &&
    logResponseOk === enums.BoolEnum.TRUE &&
    skipLog !== true
  ) {
    let part = Object.assign({}, response, { payload: undefined });
    logToConsole(part, logIsColor);
  }

  return response;
}
