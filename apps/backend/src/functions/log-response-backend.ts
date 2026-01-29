import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BackendConfig } from '#backend/config/backend-config';
import { BackendEnvEnum } from '#common/enums/env/backend-env.enum';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { isDefined } from '#common/functions/is-defined';
import { MyResponse } from '#common/interfaces/to/my-response';
import { logToConsole } from '#node-common/functions/log-to-console';
import { WrappedError } from '#node-common/functions/wrap-error';

export function logResponseBackend(item: {
  wrappedError?: WrappedError;
  response: MyResponse;
  logLevel: LogLevelEnum;
  cs: ConfigService;
  logger: Logger;
}) {
  let { response, wrappedError, logLevel, cs, logger } = item;

  let isLogOk =
    cs.get<BackendConfig['backendLogResponseOk']>('backendLogResponseOk') ===
      true && response.info.status === ResponseInfoStatusEnum.Ok;

  let isLogError =
    cs.get<BackendConfig['backendLogResponseError']>(
      'backendLogResponseError'
    ) === true && response.info.status === ResponseInfoStatusEnum.Error;

  if (isLogOk === true || isLogError === true) {
    let log = {
      response: Object.assign({}, response, { payload: undefined })
    };

    if (isDefined(wrappedError)) {
      (log as any).wrappedError = wrappedError;
    }

    logToConsole({
      log: log,
      logIsJson: cs.get<BackendConfig['backendLogIsJson']>('backendLogIsJson'),
      logger: logger,
      logLevel: logLevel,
      useLoggerOnlyForErrorLevel:
        cs.get<BackendConfig['backendEnv']>('backendEnv') !==
        BackendEnvEnum.PROD
    });
  }
}
