import { NestFactory } from '@nestjs/core';
import { WinstonModule } from 'nest-winston';
import { APP_NAME_DISK } from '~common/constants/top-disk';
import { BoolEnum } from '~common/enums/bool.enum';
import { ErEnum } from '~common/enums/er.enum';
import { getLoggerOptions } from '~node-common/functions/get-logger-options';
import { listenProcessEvents } from '~node-common/functions/listen-process-events';
import { AppModule } from './app.module';
import { getConfig } from './config/get.config';
import { logToConsoleDisk } from './functions/log-to-console-disk';

async function bootstrap() {
  listenProcessEvents({
    appTerminated: ErEnum.DISK_APP_TERMINATED,
    uncaughtException: ErEnum.DISK_UNCAUGHT_EXCEPTION,
    unhandledRejectionReason: ErEnum.DISK_UNHANDLED_REJECTION_REASON,
    unhandledRejection: ErEnum.DISK_UNHANDLED_REJECTION_ERROR,
    logToConsoleFn: logToConsoleDisk
  });

  let config = getConfig();

  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(
      getLoggerOptions({
        appName: APP_NAME_DISK,
        isJson: config.diskLogIsJson === BoolEnum.TRUE
      })
    )
  });

  await app.listen(process.env.LISTEN_PORT || 3002);
}
bootstrap();
