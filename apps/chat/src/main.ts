import 'reflect-metadata';
import { startTelemetry } from '#node-common/functions/start-telemetry';

let tracerNodeSdk = startTelemetry({
  serviceName: 'mprove-chat'
});

//
import { NestFactory } from '@nestjs/core';
import { WinstonModule } from 'nest-winston';
import { APP_NAME_CHAT } from '#common/constants/top-chat';
import { ErEnum } from '#common/enums/er.enum';
import { getLoggerOptions } from '#node-common/functions/get-logger-options';
import { listenProcessEvents } from '#node-common/functions/listen-process-events';
import { AppModule } from './app.module';
import { getConfig } from './config/get.config';
import { logToConsoleChat } from './functions/log-to-console-chat';

async function bootstrap() {
  listenProcessEvents({
    tracerNodeSdk: tracerNodeSdk,
    appTerminated: ErEnum.CHAT_APP_TERMINATED,
    uncaughtException: ErEnum.CHAT_UNCAUGHT_EXCEPTION,
    unhandledRejectionReason: ErEnum.CHAT_UNHANDLED_REJECTION_REASON,
    unhandledRejection: ErEnum.CHAT_UNHANDLED_REJECTION_ERROR,
    logToConsoleFn: logToConsoleChat
  });

  let config = getConfig();

  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(
      getLoggerOptions({
        appName: APP_NAME_CHAT,
        isJson: config.chatLogIsJson
      })
    )
  });

  await app.listen(process.env.LISTEN_PORT || 3004);
}

bootstrap().catch(err => {
  console.error('Bootstrap failed:', err);
  process.exit(1);
});
