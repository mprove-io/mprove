import { Logger } from '@nestjs/common';
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
  logResponseOk: boolean;
  logOnResponser: boolean;
  logIsJson: boolean;
  logger: Logger;
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
    logIsJson,
    logger
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

  if (logOnResponser === true && logResponseOk === true && skipLog !== true) {
    let part = Object.assign({}, response, { payload: undefined });
    logToConsole({
      log: part,
      logLevel: enums.LogLevelEnum.Info,
      logIsJson: logIsJson,
      logger: logger
    });
  }

  return response;
}
