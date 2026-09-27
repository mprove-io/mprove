import { Logger } from '@nestjs/common';
import { ErEnum } from '#common/enums/er.enum';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { makeId } from '#common/functions/make-id/make-id';
import type { ToBackendResponse } from '#common/zod/backend/response/to-backend-response';
import { logToConsole } from '#node-common/functions/log-to-console/log-to-console';
import { wrapError } from '#node-common/functions/wrap-error/wrap-error';

export function makeErrorResponse(item: {
  body: any;
  e: any;
  path: any;
  method: any;
  mproveVersion?: string;
  duration: number;
  isRemoveErrorData: boolean;
  logResponseError: boolean;
  logIsJson: boolean;
  logger: Logger;
  useLoggerOnlyForErrorLevel: boolean;
}) {
  let {
    body,
    e,
    path,
    method,
    mproveVersion,
    duration,
    isRemoveErrorData,
    logResponseError,
    logIsJson,
    logger,
    useLoggerOnlyForErrorLevel
  } = item;

  let wError = wrapError(e);

  let response: ToBackendResponse = {
    method: method,
    mproveVersion: mproveVersion,
    duration: Number.isFinite(duration) ? Math.max(0, duration) : 0,
    traceId: typeof body?.traceId === 'string' ? body.traceId : makeId(),
    result: {
      type: 'Failure',
      error:
        isRemoveErrorData === true
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
    }
  };

  if (logResponseError === true) {
    let log = {
      response: response
    };
    logToConsole({
      log: log,
      logLevel: LogLevelEnum.Error,
      logIsJson: logIsJson,
      logger: logger,
      useLoggerOnlyForErrorLevel: useLoggerOnlyForErrorLevel
    });
  }

  return { resp: response, wrappedError: wError };
}
