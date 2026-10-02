import type { Logger } from '@nestjs/common';
import { getToBackendOperation } from '#backend/functions/get-to-backend-operation';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { makeId } from '#common/functions/make-id/make-id';
import type { ToBackendOperation } from '#common/types/backend/request/to-backend-operation';
import type { ToBackendResponse } from '#common/types/backend/response/to-backend-response';
import { logToConsole } from '#node-common/functions/log-to-console/log-to-console';

export function makeOkResponse(item: {
  body: { traceId?: string };
  payload: unknown;
  path: string;
  method: string;
  mproveVersion?: string;
  duration: number;
  logResponseOk: boolean;
  logIsJson: boolean;
  logger: Logger;
  useLoggerOnlyForErrorLevel: boolean;
}): ToBackendResponse {
  let {
    body,
    payload,
    path,
    method,
    mproveVersion,
    duration,
    logResponseOk,
    logIsJson,
    logger,
    useLoggerOnlyForErrorLevel
  } = item;

  let operation: ToBackendOperation = getToBackendOperation({ path: path });

  let response: ToBackendResponse = {
    type: 'Success',
    operation: operation,
    method: method,
    mproveVersion: mproveVersion ?? '',
    duration: Math.max(0, duration),
    traceId: body?.traceId ?? makeId(),
    output: payload
  } as ToBackendResponse;

  if (logResponseOk === true) {
    let log: { response: object } = {
      response: { ...response, output: undefined }
    };

    logToConsole({
      log: log,
      logLevel: LogLevelEnum.Info,
      logIsJson: logIsJson,
      logger: logger,
      useLoggerOnlyForErrorLevel: useLoggerOnlyForErrorLevel
    });
  }

  return response;
}
