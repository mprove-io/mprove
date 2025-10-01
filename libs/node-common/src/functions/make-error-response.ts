import { Logger } from '@nestjs/common';
import { ErEnum } from '~common/enums/er.enum';
import { LogLevelEnum } from '~common/enums/log-level.enum';
import { ResponseInfoStatusEnum } from '~common/enums/response-info-status.enum';
import { isDefined } from '~common/functions/is-defined';
import { MyResponse } from '~common/interfaces/to/my-response';
import { logToConsole } from './log-to-console';
import { wrapError } from './wrap-error';

export function makeErrorResponse(item: {
  body: any;
  e: any;
  path: any;
  method: any;
  mproveVersion?: string;
  duration: number;
  isBackend: boolean;
  logResponseError: boolean;
  logIsJson: boolean;
  logger: Logger;
}) {
  let {
    body,
    e,
    path,
    method,
    mproveVersion,
    duration,
    isBackend,
    logResponseError,
    logIsJson,
    logger
  } = item;

  let wError = wrapError(e);

  let response: MyResponse = {
    info: {
      path: path,
      method: method,
      mproveVersion: mproveVersion,
      duration: duration,
      traceId: body.info?.traceId,
      status: ResponseInfoStatusEnum.Error,
      error:
        isBackend === true
          ? {
              name: undefined,
              message:
                wError.message === 'ThrottlerException: Too Many Requests'
                  ? ErEnum.TOO_MANY_REQUESTS_ERROR
                  : wError.name === 'ThrottlerException'
                    ? ErEnum.THROTTLER_ERROR
                    : Object.values(ErEnum).includes(wError.message) === true
                      ? wError.message
                      : ErEnum.INTERNAL_ERROR,
              customData: undefined,
              displayData:
                Object.values(ErEnum).includes(wError.message) === true
                  ? wError.displayData
                  : undefined,
              originalError: isDefined(wError.originalError)
                ? {
                    message:
                      Object.values(ErEnum).includes(
                        wError.originalError.message
                      ) === true
                        ? wError.originalError.message
                        : ErEnum.INTERNAL_ERROR,
                    customData: undefined,
                    displayData: Object.values(ErEnum).includes(
                      wError.originalError.message
                    )
                      ? wError.originalError.displayData
                      : undefined
                  }
                : undefined
            }
          : wError
    },
    payload: {}
  };

  if (logResponseError === true && isBackend === false) {
    let log = {
      response: Object.assign({}, response, { payload: undefined })
    };
    logToConsole({
      log: log,
      logLevel: LogLevelEnum.Error,
      logIsJson: logIsJson,
      logger: logger
    });
  }

  return { resp: response, wrappedError: wError };
}
