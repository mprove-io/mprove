import { NestFactory } from '@nestjs/core';
import { json, urlencoded } from 'body-parser';
import 'module-alias/register';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { listenProcessEventsBackend } from './functions/listen-process-events-backend';

async function bootstrap() {
  listenProcessEventsBackend();

  const app = await NestFactory.create(AppModule, {
    bufferLogs: true
  });

  app.useLogger(app.get(Logger));
  // use after nestjs 8
  // app.setGlobalPrefix('api');
  // app.setGlobalPrefix(constants.API_PATH);
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ limit: '50mb', extended: true }));
  app.enableCors();

  await app.listen(process.env.LISTEN_PORT || 3000);
}
bootstrap();
