import 'reflect-metadata';
import { startTelemetry } from '#node-common/functions/start-telemetry';

let tracerNodeSdk = startTelemetry({
  serviceName: 'mprove-blockml'
});

//
import { NestFactory } from '@nestjs/core';
import { WinstonModule } from 'nest-winston';
import { logToConsoleBlockml } from '#blockml/functions/log-to-console-blockml/log-to-console-blockml';
import { APP_NAME_BLOCKML } from '#common/constants/top-blockml';
import { ErEnum } from '#common/enums/er.enum';
import { getLoggerOptions } from '#node-common/functions/get-logger-options';
import { listenProcessEvents } from '#node-common/functions/listen-process-events';
import { AppModule } from './app.module';
import { getConfig } from './config/get.config';

async function bootstrap() {
  listenProcessEvents({
    tracerNodeSdk: tracerNodeSdk,
    appTerminated: ErEnum.BLOCKML_APP_TERMINATED,
    uncaughtException: ErEnum.BLOCKML_UNCAUGHT_EXCEPTION,
    unhandledRejectionReason: ErEnum.BLOCKML_UNHANDLED_REJECTION_REASON,
    unhandledRejection: ErEnum.BLOCKML_UNHANDLED_REJECTION_ERROR,
    logToConsoleFn: logToConsoleBlockml
  });

  let config = getConfig();

  let app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(
      getLoggerOptions({
        appName: APP_NAME_BLOCKML,
        isJson: config.blockmlLogIsJson
      })
    )
  });

  await app.listen(process.env.LISTEN_PORT || 3001);
}

bootstrap().catch(err => {
  console.error('Bootstrap failed:', err);
  process.exit(1);
});
