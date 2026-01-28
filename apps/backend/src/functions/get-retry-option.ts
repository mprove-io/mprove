import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WrapOptions } from 'retry';
import { ErEnum } from '#common/enums/er.enum';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { ServerError } from '#common/models/server-error';
import { BackendConfig } from '~backend/config/backend-config';
import { logToConsoleBackend } from './log-to-console-backend';

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
          message: ErEnum.BACKEND_TRANSACTION_RETRY,
          originalError: e
        }),
        logLevel: LogLevelEnum.Error,
        logger: logger,
        cs: cs
      });
    }
  };

  return myWrapOptions;
}
