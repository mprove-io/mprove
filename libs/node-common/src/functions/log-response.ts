import { Logger } from '@nestjs/common';
import { enums } from '~common/barrels/enums';
import { MyResponse } from '~common/interfaces/_index';
import { logToConsole } from './log-to-console';

export function logResponse(item: {
  response: MyResponse;
  logResponseOk: boolean;
  logResponseError: boolean;
  logOnResponser: boolean;
  logIsJson: boolean;
  logger: Logger;
  logLevel: enums.LogLevelEnum;
}) {
  let {
    response,
    logResponseOk,
    logResponseError,
    logOnResponser,
    logIsJson,
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
    let log = {
      response: Object.assign({}, response, { payload: undefined })
    };
    logToConsole({
      log: log,
      logIsJson: logIsJson,
      logger: logger,
      logLevel: logLevel
    });
  }
}
