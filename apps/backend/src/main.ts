import { NestFactory } from '@nestjs/core';
import { json, urlencoded } from 'body-parser';
import 'module-alias/register';
import { WinstonModule } from 'nest-winston';
import { AppModule } from './app.module';
import { common } from './barrels/common';
import { constants } from './barrels/constants';
import { getConfig } from './config/get.config';
import { listenProcessEventsBackend } from './functions/listen-process-events-backend';

async function bootstrap() {
  listenProcessEventsBackend();

  let config = getConfig();

  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(
      config.backendLogIsJson === common.BoolEnum.TRUE
        ? constants.WINSTON_JSON_OPTIONS
        : constants.WINSTON_PRETTY_OPTIONS
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
