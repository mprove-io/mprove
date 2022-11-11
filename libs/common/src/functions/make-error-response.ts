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
  logResponseError: boolean;
  logOnResponser: boolean;
  logIsColor: boolean;
  logIsStringify: boolean;
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
    logIsColor,
    logIsStringify
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
    logOnResponser === true &&
    logResponseError === true &&
    skipLog !== true
  ) {
    let part = Object.assign({}, response, { payload: undefined });
    logToConsole({
      log: part,
      logIsColor: logIsColor,
      logIsStringify: logIsStringify
    });
  }

  return response;
}
