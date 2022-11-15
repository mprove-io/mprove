import { NestFactory } from '@nestjs/core';
import 'module-alias/register';
import { WinstonModule } from 'nest-winston';
import { AppModule } from './app.module';
import { common } from './barrels/common';
import { constants } from './barrels/constants';
import { nodeCommon } from './barrels/node-common';
import { getConfig } from './config/get.config';
import { listenProcessEventsDisk } from './functions/listen-process-events-disk';

async function bootstrap() {
  listenProcessEventsDisk();

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
