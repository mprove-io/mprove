import { NestFactory } from '@nestjs/core';
import { json, urlencoded } from 'body-parser';
import { WinstonModule } from 'nest-winston';
import { AppModule } from './app.module';
import { common } from './barrels/common';
import { constants } from './barrels/constants';
import { nodeCommon } from './barrels/node-common';
import { getConfig } from './config/get.config';
import { logToConsoleBackend } from './functions/log-to-console-backend';

async function bootstrap() {
  nodeCommon.listenProcessEvents({
    appTerminated: common.ErEnum.BACKEND_APP_TERMINATED,
    uncaughtException: common.ErEnum.BACKEND_UNCAUGHT_EXCEPTION,
    unhandledRejectionReason: common.ErEnum.BACKEND_UNHANDLED_REJECTION_REASON,
    unhandledRejection: common.ErEnum.BACKEND_UNHANDLED_REJECTION_ERROR,
    logToConsoleFn: logToConsoleBackend
  });

  let config = getConfig();

  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(
      nodeCommon.getLoggerOptions({
        appName:
          config.isScheduler === common.BoolEnum.TRUE
            ? constants.APP_NAME_SCHEDULER
            : constants.APP_NAME_BACKEND,

        isJson: config.backendLogIsJson === common.BoolEnum.TRUE
      })
    )
  });

  // use after nestjs 8
  // app.setGlobalPrefix('api');
  // app.setGlobalPrefix(constants.API_PATH);
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ limit: '50mb', extended: true }));

  app.enableCors();

  await app.listen(process.env.LISTEN_PORT || 3000);
}
bootstrap();
