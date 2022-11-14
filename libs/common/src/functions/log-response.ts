import { Logger } from '@nestjs/common';
import { enums } from '~common/barrels/enums';
import { MyResponse } from '~common/interfaces/_index';
import { logToConsole } from './log-to-console';

export function logResponse(item: {
  response: MyResponse;
  logResponseOk: boolean;
  logResponseError: boolean;
  logOnResponser: boolean;
  logIsStringify: boolean;
  logger: Logger;
  logLevel: enums.LogLevelEnum;
}) {
  let {
    response,
    logResponseOk,
    logResponseError,
    logOnResponser,
    logIsStringify,
    logger,
    logLevel
  } = item;

  let isLogOk =
    logResponseOk === true &&
    response.info.status === enums.ResponseInfoStatusEnum.Ok;

  let isLogError =
    logResponseError === true &&
    response.info.status === enums.ResponseInfoStatusEnum.Error;

  if (logOnResponser === true && (isLogOk || isLogError)) {
    let part = Object.assign({}, response, { payload: undefined });
    logToConsole({
      log: part,
      logIsStringify: logIsStringify,
      logger: logger,
      logLevel: logLevel
    });
  }
}
