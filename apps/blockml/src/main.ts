import { NestFactory } from '@nestjs/core';
import 'module-alias/register';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { listenProcessEventsBlockml } from './functions/listen-process-events-blockml';

async function bootstrap() {
  listenProcessEventsBlockml();

  const app = await NestFactory.create(AppModule, {
    bufferLogs: true
  });

  app.useLogger(app.get(Logger));

  await app.listen(process.env.LISTEN_PORT || 3001);
}
bootstrap();
