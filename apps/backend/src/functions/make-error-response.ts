import type { Logger } from '@nestjs/common';
import { getToBackendOperation } from '#backend/functions/get-to-backend-operation';
import { ErEnum } from '#common/enums/er.enum';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { makeId } from '#common/functions/make-id/make-id';
import type { ToBackendOperation } from '#common/zod/backend/request/to-backend-operation';
import type { ToBackendResponse } from '#common/zod/backend/response/to-backend-response';
import type { ToBackendResponseMetadata } from '#common/zod/backend/response/to-backend-response-metadata';
import { logToConsole } from '#node-common/functions/log-to-console/log-to-console';
import {
  type WrappedError,
  wrapError
} from '#node-common/functions/wrap-error/wrap-error';

export function makeErrorResponse(item: {
  body: { traceId?: string };
  e: unknown;
  path: string;
  method: string;
  mproveVersion?: string;
  duration: number;
  logResponseError: boolean;
  logIsJson: boolean;
  logger: Logger;
  useLoggerOnlyForErrorLevel: boolean;
}): { resp: ToBackendResponse; wrappedError: WrappedError } {
  let {
    body,
    e,
    path,
    method,
    mproveVersion,
    duration,
    logResponseError,
    logIsJson,
    logger,
    useLoggerOnlyForErrorLevel
  } = item;

  let wrappedError: WrappedError = wrapError(e);

  let operation: ToBackendOperation = getToBackendOperation({ path: path });

  let metadata: ToBackendResponseMetadata<string> = {
    operation: operation ?? path,
    method: method,
    mproveVersion: mproveVersion ?? '',
    duration: Number.isFinite(duration) ? Math.max(0, duration) : 0,
    traceId: typeof body?.traceId === 'string' ? body.traceId : makeId()
  };

  let response: ToBackendResponse;

  if (isDefined(operation)) {
    let code: string =
      wrappedError.message === 'ThrottlerException: Too Many Requests'
        ? ErEnum.TOO_MANY_REQUESTS_ERROR
        : wrappedError.name === 'ThrottlerException'
          ? ErEnum.THROTTLER_ERROR
          : wrappedError.message === ErEnum.BACKEND_WRONG_REQUEST_PARAMS
            ? 'BACKEND_INVALID_REQUEST'
            : typeof wrappedError.message === 'string' &&
                Object.values(ErEnum).some(
                  value => value === wrappedError.message
                )
              ? wrappedError.message
              : 'BACKEND_INTERNAL';

    response = {
      type: 'Failure',
      ...metadata,
      operation: operation,
      error: {
        code: code,
        displayData:
          code === 'BACKEND_INTERNAL'
            ? undefined
            : code === 'BACKEND_INVALID_REQUEST'
              ? (wrappedError.displayData ?? [])
              : wrappedError.displayData,
        originalError:
          (code === ErEnum.BACKEND_ERROR_RESPONSE_FROM_DISK ||
            code === ErEnum.BACKEND_ERROR_RESPONSE_FROM_BLOCKML) &&
          isDefined(wrappedError.originalError)
            ? {
                code: wrappedError.originalError.message,
                displayData: wrappedError.originalError.displayData
              }
            : undefined
      }
    } as ToBackendResponse;
  } else {
    response = {
      type: 'Failure',
      ...metadata,
      error: {
        code: 'BACKEND_INVALID_REQUEST',
        displayData: [
          {
            path: 'operation',
            message: 'Unknown backend operation',
            code: 'invalid_value'
          }
        ]
      }
    };
  }

  if (logResponseError === true) {
    let log = {
      response: response,
      wrappedError: wrappedError
    };

    logToConsole({
      log: log,
      logLevel: LogLevelEnum.Error,
      logIsJson: logIsJson,
      logger: logger,
      useLoggerOnlyForErrorLevel: useLoggerOnlyForErrorLevel
    });
  }

  let payload: { resp: ToBackendResponse; wrappedError: WrappedError } = {
    resp: response,
    wrappedError: wrappedError
  };

  return payload;
}
