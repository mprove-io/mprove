import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BackendConfig } from '#backend/config/backend-config';
import { BackendEnvEnum } from '#common/enums/env/backend-env.enum';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { ToBackendResponse } from '#common/zod/backend/response/to-backend-response';
import { logToConsole } from '#node-common/functions/log-to-console/log-to-console';
import { WrappedError } from '#node-common/functions/wrap-error/wrap-error';

export function logResponseBackend(item: {
  wrappedError?: WrappedError;
  response: ToBackendResponse;
  logLevel: LogLevelEnum;
  cs: ConfigService;
  logger: Logger;
}) {
  let { response, wrappedError, logLevel, cs, logger } = item;

  let isLogOk =
    cs.get<BackendConfig['backendLogResponseOk']>('backendLogResponseOk') ===
      true && response.result.type === 'Success';

  let isLogError =
    cs.get<BackendConfig['backendLogResponseError']>(
      'backendLogResponseError'
    ) === true && response.result.type === 'Failure';

  if (isLogOk === true || isLogError === true) {
    let log = {
      response: Object.assign({}, response, {
        result:
          response.result.type === 'Success'
            ? { type: 'Success' }
            : response.result
      })
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
