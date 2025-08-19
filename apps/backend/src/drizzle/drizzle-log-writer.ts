import { ConfigService } from '@nestjs/config';
import { LogWriter } from 'drizzle-orm';
import { logToConsoleBackend } from '~backend/functions/log-to-console-backend';
import { LogLevelEnum } from '~common/enums/log-level.enum';
import { BackendConfig } from '~common/interfaces/backend/backend-config';

export class DrizzleLogWriter implements LogWriter {
  constructor(
    private logger: any,
    private cs: ConfigService<BackendConfig>,
    private prefix: string
  ) {}

  write(message: string) {
    logToConsoleBackend({
      log: `[${this.prefix}] ${message}`,
      logLevel: LogLevelEnum.Info,
      logger: this.logger,
      cs: this.cs
    });
  }
}
