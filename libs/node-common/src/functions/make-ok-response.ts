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
  mproveVersion?: string;
  duration: number;
  isBackend: boolean;
  logResponseOk: boolean;
  logIsJson: boolean;
  logger: Logger;
}) {
  let {
    body,
    payload,
    path,
    method,
    mproveVersion,
    duration,
    isBackend,
    logResponseOk,
    logIsJson,
    logger
  } = item;

  let response: MyResponse = {
    info: {
      path: path,
      method: method,
      mproveVersion: mproveVersion,
      duration: duration,
      traceId: body.info?.traceId,
      status: ResponseInfoStatusEnum.Ok
    },
    payload: payload
  };

  if (logResponseOk === true && isBackend === false) {
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
