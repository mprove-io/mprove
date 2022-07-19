import { enums } from '~common/barrels/enums';
import { MyResponse } from '~common/interfaces/_index';
import { logToConsole } from './log-to-console';
import { wrapError } from './wrap-error';

export function makeErrorResponse(item: {
  request?: any;
  path?: any;
  method?: any;
  duration?: number;
  body: any;
  e: any;
  skipLog?: boolean;
  logResponseError: enums.BoolEnum;
  logOnResponser: enums.BoolEnum;
  logIsColor: enums.BoolEnum;
}) {
  let {
    body,
    e,
    request,
    path,
    method,
    duration,
    skipLog,
    logResponseError,
    logOnResponser,
    logIsColor
  } = item;

  let response: MyResponse = {
    info: {
      path: request?.url || path,
      method: request?.method || method,
      duration: duration,
      traceId: body.info?.traceId,
      status: enums.ResponseInfoStatusEnum.Error,
      error: wrapError(e)
    },
    payload: {}
  };

  if (
    logOnResponser === enums.BoolEnum.TRUE &&
    logResponseError === enums.BoolEnum.TRUE &&
    skipLog !== true
  ) {
    let part = Object.assign({}, response, { payload: undefined });
    logToConsole(part, logIsColor);
  }

  return response;
}
