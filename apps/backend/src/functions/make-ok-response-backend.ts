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
  mproveVersion: string;
  duration: number;
  skipLog?: boolean;
  cs: ConfigService<BackendConfig>;
  logger: Logger;
}) {
  let {
    payload,
    body,
    path,
    method,
    mproveVersion,
    duration,
    skipLog,
    cs,
    logger
  } = item;

  return makeOkResponse({
    body: body,
    payload: payload,
    path: path,
    method: method,
    mproveVersion: mproveVersion,
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
