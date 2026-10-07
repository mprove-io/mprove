import type { Logger } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import type { WrapOptions } from 'retry';
import type { BackendConfig } from '#backend/config/backend-config';
import { logToConsoleBackend } from '#backend/functions/top/log-to-console-backend/log-to-console-backend';
import type { BackendTransactionRetryError } from '#common/types/backend/errors/backend-transaction-retry-error';

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
        log: {
          code: 'BACKEND_TRANSACTION_RETRY' satisfies BackendTransactionRetryError['code'],
          originalError: e
        },
        logLevel: 'Error',
        logger: logger,
        cs: cs
      });
    }
  };

  return myWrapOptions;
}
