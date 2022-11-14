import { NestFactory } from '@nestjs/core';
import 'module-alias/register';
import { WinstonModule } from 'nest-winston';
import { AppModule } from './app.module';
import { common } from './barrels/common';
import { constants } from './barrels/constants';
import { getConfig } from './config/get.config';
import { listenProcessEventsBlockml } from './functions/listen-process-events-blockml';

async function bootstrap() {
  listenProcessEventsBlockml();

  let config = getConfig();

  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(
      config.blockmlLogIsStringify === common.BoolEnum.TRUE
        ? constants.WINSTON_JSON_OPTIONS
        : constants.WINSTON_PRETTY_OPTIONS
    )
  });

  await app.listen(process.env.LISTEN_PORT || 3001);
}
bootstrap();
