import { Logger } from '@nestjs/common';
import { LogLevelEnum } from '~common/enums/log-level.enum';
import { ResponseInfoStatusEnum } from '~common/enums/response-info-status.enum';
import { MyResponse } from '~common/interfaces/to/my-response';
import { logToConsole } from './log-to-console';

export function makeOkResponse(item: {
  body: any;
  payload: any;
  path: any;
  method: any;
  duration: number;
  skipLog?: boolean;
  logResponseOk: boolean;
  logIsJson: boolean;
  logger: Logger;
}) {
  let {
    body,
    payload,
    path,
    method,
    duration,
    skipLog,
    logResponseOk,
    logIsJson,
    logger
  } = item;

  let response: MyResponse = {
    info: {
      path: path,
      method: method,
      duration: duration,
      traceId: body.info?.traceId,
      status: ResponseInfoStatusEnum.Ok
    },
    payload: payload
  };

  if (logResponseOk === true && skipLog !== true) {
    let log = {
      response: Object.assign({}, response, { payload: undefined })
    };
    logToConsole({
      log: log,
      logLevel: LogLevelEnum.Info,
      logIsJson: logIsJson,
      logger: logger
    });
  }

  return response;
}
