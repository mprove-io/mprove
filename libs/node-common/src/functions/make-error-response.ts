import { Logger } from '@nestjs/common';
import { enums } from '~common/barrels/enums';
import { MyResponse } from '~common/interfaces/_index';
import { logToConsole } from './log-to-console';
import { wrapError } from './wrap-error';

export function makeErrorResponse(item: {
  body: any;
  e: any;
  path: any;
  method: any;
  duration: number;
  skipLog?: boolean;
  logResponseError: boolean;
  logIsJson: boolean;
  logger: Logger;
}) {
  let {
    body,
    e,
    path,
    method,
    duration,
    skipLog,
    logResponseError,
    logIsJson,
    logger
  } = item;

  let response: MyResponse = {
    info: {
      path: path,
      method: method,
      duration: duration,
      traceId: body.info?.traceId,
      status: enums.ResponseInfoStatusEnum.Error,
      error: wrapError(e)
    },
    payload: {}
  };

  if (logResponseError === true && skipLog !== true) {
    let log = {
      response: Object.assign({}, response, { payload: undefined })
    };
    logToConsole({
      log: log,
      logLevel: enums.LogLevelEnum.Error,
      logIsJson: logIsJson,
      logger: logger
    });
  }

  return response;
}
