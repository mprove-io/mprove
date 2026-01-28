import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BackendEnvEnum } from '#common/enums/env/backend-env.enum';
import { makeErrorResponse } from '#node-common/functions/make-error-response';
import { BackendConfig } from '~backend/config/backend-config';

export function makeErrorResponseBackend(item: {
  body: any;
  e: any;
  path: any;
  method: any;
  mproveVersion: string;
  duration: number;
  cs: ConfigService<BackendConfig>;
  logger: Logger;
}) {
  let { e, body, cs, path, method, mproveVersion, duration, logger } = item;

  return makeErrorResponse({
    body: body,
    e: e,
    path: path,
    method: method,
    mproveVersion: mproveVersion,
    duration: duration,
    isRemoveErrorData:
      cs.get<BackendConfig['backendEnv']>('backendEnv') === BackendEnvEnum.PROD,
    logResponseError: false, // logged already in log-response-backend.ts
    // logResponseError: cs.get<BackendConfig['backendLogResponseError']>(
    //   'backendLogResponseError'
    // ),
    logIsJson: cs.get<BackendConfig['backendLogIsJson']>('backendLogIsJson'),
    logger: logger,
    useLoggerOnlyForErrorLevel:
      cs.get<BackendConfig['backendEnv']>('backendEnv') !== BackendEnvEnum.PROD
  });
}
