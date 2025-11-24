import { NestFactory } from '@nestjs/core';
import { json, urlencoded } from 'body-parser';
import { WinstonModule } from 'nest-winston';
import {
  APP_NAME_BACKEND,
  APP_NAME_SCHEDULER
} from '~common/constants/top-backend';
import { ErEnum } from '~common/enums/er.enum';
import { getLoggerOptions } from '~node-common/functions/get-logger-options';
import { listenProcessEvents } from '~node-common/functions/listen-process-events';
import { AppModule } from './app.module';
import { getConfig } from './config/get.config';
import { logToConsoleBackend } from './functions/log-to-console-backend';

async function bootstrap() {
  listenProcessEvents({
    appTerminated: ErEnum.BACKEND_APP_TERMINATED,
    uncaughtException: ErEnum.BACKEND_UNCAUGHT_EXCEPTION,
    unhandledRejectionReason: ErEnum.BACKEND_UNHANDLED_REJECTION_REASON,
    unhandledRejection: ErEnum.BACKEND_UNHANDLED_REJECTION_ERROR,
    logToConsoleFn: logToConsoleBackend
  });

  let config = getConfig();

  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(
      getLoggerOptions({
        appName:
          config.isScheduler === true ? APP_NAME_SCHEDULER : APP_NAME_BACKEND,

        isJson: config.backendLogIsJson
      })
    )
  });

  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ limit: '50mb', extended: true }));

  app.enableCors();

  await app.listen(process.env.LISTEN_PORT || 3000);
}

bootstrap().catch(err => {
  console.error('Bootstrap failed:', err);
  process.exit(1);
});
