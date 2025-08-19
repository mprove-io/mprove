import { NestFactory } from '@nestjs/core';
import { WinstonModule } from 'nest-winston';
import { APP_NAME_BLOCKML } from '~common/constants/top-blockml';
import { BoolEnum } from '~common/enums/bool.enum';
import { ErEnum } from '~common/enums/er.enum';
import { getLoggerOptions } from '~node-common/functions/get-logger-options';
import { listenProcessEvents } from '~node-common/functions/listen-process-events';
import { AppModule } from './app.module';
import { getConfig } from './config/get.config';
import { logToConsoleBlockml } from './functions/extra/log-to-console-blockml';

async function bootstrap() {
  listenProcessEvents({
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
        isJson: config.blockmlLogIsJson === BoolEnum.TRUE
      })
    )
  });

  await app.listen(process.env.LISTEN_PORT || 3001);
}
bootstrap();
