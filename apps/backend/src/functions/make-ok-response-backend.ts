import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BackendConfig } from '~backend/config/backend-config';
import { BackendEnvEnum } from '~common/enums/env/backend-env.enum';
import { enumToBoolean } from '~common/functions/enum-to-boolean';
import { makeOkResponse } from '~node-common/functions/make-ok-response';

export function makeOkResponseBackend(item: {
  body: any;
  payload: any;
  path: any;
  method: any;
  mproveVersion: string;
  duration: number;
  cs: ConfigService<BackendConfig>;
  logger: Logger;
}) {
  let { payload, body, path, method, mproveVersion, duration, cs, logger } =
    item;

  return makeOkResponse({
    body: body,
    payload: payload,
    path: path,
    method: method,
    mproveVersion: mproveVersion,
    duration: duration,
    logResponseOk: false, // logged already in log-response-backend.ts
    // logResponseOk: enumToBoolean(
    //   cs.get<BackendConfig['backendLogResponseOk']>('backendLogResponseOk')
    // ),
    logIsJson: enumToBoolean(
      cs.get<BackendConfig['backendLogIsJson']>('backendLogIsJson')
    ),
    logger: logger,
    useLoggerOnlyForErrorLevel:
      cs.get<BackendConfig['backendEnv']>('backendEnv') !== BackendEnvEnum.PROD
  });
}
