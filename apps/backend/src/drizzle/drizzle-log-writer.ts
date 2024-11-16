import { ConfigService } from '@nestjs/config';
import { LogWriter } from 'drizzle-orm';
import { common } from '~backend/barrels/common';
import { interfaces } from '~backend/barrels/interfaces';
import { logToConsoleBackend } from '~backend/functions/log-to-console-backend';

export class DrizzleLogWriter implements LogWriter {
  constructor(
    private logger: any,
    private cs: ConfigService<interfaces.Config>,
    private prefix: string
  ) {}

  write(message: string) {
    logToConsoleBackend({
      log: `[${this.prefix}] ${message}`,
      logLevel: common.LogLevelEnum.Info,
      logger: this.logger,
      cs: this.cs
    });
  }
}
