import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BackendConfig } from '~backend/config/backend-config';
import { enumToBoolean } from '~common/functions/enum-to-boolean';
import { makeErrorResponse } from '~node-common/functions/make-error-response';

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
    isBackend: true,
    logResponseError: enumToBoolean(
      cs.get<BackendConfig['backendLogResponseError']>(
        'backendLogResponseError'
      )
    ),
    logIsJson: enumToBoolean(
      cs.get<BackendConfig['backendLogIsJson']>('backendLogIsJson')
    ),
    logger: logger
  });
}
