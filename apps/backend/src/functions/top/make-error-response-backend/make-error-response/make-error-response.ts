import type { Logger } from '@nestjs/common';
import { getToBackendOperation } from '#backend/functions/top/get-to-backend-operation/get-to-backend-operation';
import { ServerError } from '#common/classes/server-error/server-error';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { makeId } from '#common/functions/make-id/make-id';
import type { BackendUnauthorizedError } from '#common/types/backend/errors/backend-unauthorized-error';
import type { ToBackendOperation } from '#common/types/backend/request/to-backend-operation';
import type { ToBackendResponse } from '#common/types/backend/response/to-backend-response';
import type { ToBackendResponseMetadata } from '#common/types/backend/response/to-backend-response-metadata';
import { type Er, erValues } from '#common/types/shared/errors/er';
import { logToConsole } from '#node-common/functions/log-to-console/log-to-console';
import {
  type WrappedError,
  wrapError
} from '#node-common/functions/wrap-error/wrap-error';

export type MakeErrorResponseOutput = {
  resp: ToBackendResponse;
  wrappedError: WrappedError;
};

export function makeErrorResponse(item: {
  body: { traceId?: string };
  e: unknown;
  unauthorizedError?: BackendUnauthorizedError;
  path: string;
  method: string;
  mproveVersion?: string;
  duration: number;
  logResponseError: boolean;
  logIsJson: boolean;
  logger: Logger;
  useLoggerOnlyForErrorLevel: boolean;
}): MakeErrorResponseOutput {
  let {
    body,
    e,
    unauthorizedError,
    path,
    method,
    mproveVersion,
    duration,
    logResponseError,
    logIsJson,
    logger,
    useLoggerOnlyForErrorLevel
  } = item;

  let wrappedError: WrappedError;

  if (isDefined(unauthorizedError)) {
    // This diagnostic carrier is never thrown or used to classify a domain failure.
    let unauthorizedExtraError: ServerError = new ServerError({
      message: unauthorizedError.code,
      originalError: e
    });

    wrappedError = wrapError(unauthorizedExtraError);
  } else {
    wrappedError = wrapError(e);
  }

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
    let code: string = isDefined(unauthorizedError)
      ? unauthorizedError.code
      : wrappedError.message === 'ThrottlerException: Too Many Requests'
        ? ('TOO_MANY_REQUESTS_ERROR' satisfies Er)
        : wrappedError.name === 'ThrottlerException'
          ? ('THROTTLER_ERROR' satisfies Er)
          : typeof wrappedError.message === 'string' &&
              erValues.some(value => value === wrappedError.message)
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
          (code === ('BACKEND_ERROR_RESPONSE_FROM_DISK' satisfies Er) ||
            code === ('BACKEND_ERROR_RESPONSE_FROM_BLOCKML' satisfies Er)) &&
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
      logLevel: 'Error',
      logIsJson: logIsJson,
      logger: logger,
      useLoggerOnlyForErrorLevel: useLoggerOnlyForErrorLevel
    });
  }

  let payload: MakeErrorResponseOutput = {
    resp: response,
    wrappedError: wrappedError
  };

  return payload;
}
