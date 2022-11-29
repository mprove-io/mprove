import { NestFactory } from '@nestjs/core';
// import 'module-alias/register';
import { WinstonModule } from 'nest-winston';
import { AppModule } from './app.module';
import { common } from './barrels/common';
import { constants } from './barrels/constants';
import { nodeCommon } from './barrels/node-common';
import { getConfig } from './config/get.config';
import { logToConsoleDisk } from './functions/log-to-console-disk';

async function bootstrap() {
  nodeCommon.listenProcessEvents({
    appTerminated: common.ErEnum.DISK_APP_TERMINATED,
    uncaughtException: common.ErEnum.DISK_UNCAUGHT_EXCEPTION,
    unhandledRejectionReason: common.ErEnum.DISK_UNHANDLED_REJECTION_REASON,
    unhandledRejection: common.ErEnum.DISK_UNHANDLED_REJECTION_ERROR,
    logToConsoleFn: logToConsoleDisk
  });

  let config = getConfig();

  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(
      nodeCommon.getLoggerOptions({
        appName: constants.APP_NAME_DISK,
        isJson: config.diskLogIsJson === common.BoolEnum.TRUE
      })
    )
  });

  await app.listen(process.env.LISTEN_PORT || 3002);
}
bootstrap();
