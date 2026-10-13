import type { Logger } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import type { BackendConfig } from '#backend/config/backend-config';
import {
  type MakeErrorResponseOutput,
  makeErrorResponse
} from '#backend/functions/top/make-error-response-backend/make-error-response/make-error-response';
import type { BackendUnauthorizedError } from '#common/types/backend/errors/backend-unauthorized-error';

export function makeErrorResponseBackend(item: {
  body: any;
  e: any;
  unauthorizedError?: BackendUnauthorizedError;
  path: any;
  method: any;
  mproveVersion: string;
  duration: number;
  cs: ConfigService<BackendConfig>;
  logger: Logger;
}): MakeErrorResponseOutput {
  let {
    e,
    unauthorizedError,
    body,
    cs,
    path,
    method,
    mproveVersion,
    duration,
    logger
  } = item;

  let responseOutput: MakeErrorResponseOutput = makeErrorResponse({
    body: body,
    e: e,
    unauthorizedError: unauthorizedError,
    path: path,
    method: method,
    mproveVersion: mproveVersion,
    duration: duration,
    logResponseError: false, // logged already in log-response-backend.ts
    // logResponseError: cs.get<BackendConfig['backendLogResponseError']>(
    //   'backendLogResponseError'
    // ),
    logIsJson: cs.get<BackendConfig['backendLogIsJson']>('backendLogIsJson'),
    logger: logger,
    useLoggerOnlyForErrorLevel:
      cs.get<BackendConfig['backendEnv']>('backendEnv') !== 'PROD'
  });

  return responseOutput;
}
