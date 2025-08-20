import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BackendConfig } from '~backend/config/backend-config';
import { enumToBoolean } from '~common/functions/enum-to-boolean';
import { makeOkResponse } from '~node-common/functions/make-ok-response';

export function makeOkResponseBackend(item: {
  body: any;
  payload: any;
  path: any;
  method: any;
  duration: number;
  skipLog?: boolean;
  cs: ConfigService<BackendConfig>;
  logger: Logger;
}) {
  let { payload, body, path, method, duration, skipLog, cs, logger } = item;

  return makeOkResponse({
    body: body,
    payload: payload,
    path: path,
    method: method,
    duration: duration,
    skipLog: skipLog,
    logResponseOk: enumToBoolean(
      cs.get<BackendConfig['backendLogResponseOk']>('backendLogResponseOk')
    ),
    logIsJson: enumToBoolean(
      cs.get<BackendConfig['backendLogIsJson']>('backendLogIsJson')
    ),
    logger: logger
  });
}
