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
        isBackend === false
          ? wError
          : {
              name: undefined,
              message:
                Object.values(ErEnum).includes(wError.message) === true
                  ? wError.message
                  : ErEnum.INTERNAL_ERROR,
              data:
                wError.message === ErEnum.BACKEND_WRONG_REQUEST_PARAMS
                  ? wError.data
                  : undefined,
              originalError: isDefined(wError.originalError)
                ? {
                    message:
                      Object.values(ErEnum).includes(
                        wError.originalError.message
                      ) === true
                        ? wError.originalError.message
                        : ErEnum.INTERNAL_ERROR,
                    data:
                      [
                        ErEnum.DISK_WRONG_REQUEST_PARAMS,
                        ErEnum.BLOCKML_WRONG_REQUEST_PARAMS
                      ].indexOf(wError.originalError.message) > -1
                        ? wError.originalError.data
                        : isDefined(wError.originalError.data?.currentBranch) ||
                            isDefined(wError.originalError.data?.encodedFileId)
                          ? {
                              currentBranch:
                                wError.originalError.data.currentBranch,
                              encodedFileId:
                                wError.originalError.data.encodedFileId
                            }
                          : undefined
                  }
                : undefined
            }
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
