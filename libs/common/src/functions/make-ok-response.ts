import { PinoLogger } from 'nestjs-pino';
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
  logIsColor: boolean;
  logIsStringify: boolean;
  pinoLogger: PinoLogger;
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
    logIsColor,
    logIsStringify,
    pinoLogger
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
      logIsColor: logIsColor,
      logIsStringify: logIsStringify,
      pinoLogger: pinoLogger,
      logLevel: enums.LogLevelEnum.Info
    });
  }

  return response;
}
