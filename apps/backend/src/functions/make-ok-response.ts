import { Logger } from '@nestjs/common';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { makeId } from '#common/functions/make-id/make-id';
import type { ToBackendResponse } from '#common/zod/backend/response/to-backend-response';
import { logToConsole } from '#node-common/functions/log-to-console/log-to-console';

export function makeOkResponse(item: {
  body: any;
  payload: any;
  path: any;
  method: any;
  mproveVersion?: string;
  duration: number;
  logResponseOk: boolean;
  logIsJson: boolean;
  logger: Logger;
  useLoggerOnlyForErrorLevel: boolean;
}) {
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

  let response: ToBackendResponse = {
    method: method,
    mproveVersion: mproveVersion,
    duration: duration,
    traceId: body?.traceId ?? makeId(),
    result: { type: 'Success', value: payload }
  };

  if (logResponseOk === true) {
    let log = {
      response: Object.assign({}, response, {
        result: { type: response.result.type }
      })
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
