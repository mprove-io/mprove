import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WrapOptions } from 'retry';
import { BackendConfig } from '#backend/config/backend-config';
import { logToConsoleBackend } from '#backend/functions/top/log-to-console-backend/log-to-console-backend';
import { ServerError } from '#common/classes/server-error/server-error';

interface MyWrapOptions extends WrapOptions {
  onRetry: any;
}

export function getRetryOption(
  cs: ConfigService<BackendConfig>,
  logger: Logger
) {
  let myWrapOptions: MyWrapOptions = {
    retries: 2, // (default 10)
    minTimeout: 1000, // ms (default 1000)
    factor: 1, // (default 2)
    randomize: true, // 1 to 2 (default true)
    onRetry: (e: any) => {
      logToConsoleBackend({
        log: new ServerError({
          message: 'BACKEND_TRANSACTION_RETRY',
          originalError: e
        }),
        logLevel: 'Error',
        logger: logger,
        cs: cs
      });
    }
  };

  return myWrapOptions;
}
