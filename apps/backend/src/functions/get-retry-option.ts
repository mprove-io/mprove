import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WrapOptions } from 'retry';
import { common } from '~backend/barrels/common';
import { interfaces } from '~backend/barrels/interfaces';
import { logToConsoleBackend } from './log-to-console-backend';

interface MyWrapOptions extends WrapOptions {
  onRetry: any;
}

export function getRetryOption(
  cs: ConfigService<interfaces.Config>,
  logger: Logger
) {
  let w: MyWrapOptions = {
    retries: 3, // (default 10)
    minTimeout: 1000, // ms (default 1000)
    factor: 1, // (default 2)
    randomize: true, // 1 to 2 (default true)
    onRetry: (e: any) => {
      logToConsoleBackend({
        log: new common.ServerError({
          message: common.ErEnum.BACKEND_TRANSACTION_RETRY,
          originalError: e
        }),
        logLevel: common.LogLevelEnum.Error,
        logger: logger,
        cs: cs
      });
    }
  };
}
