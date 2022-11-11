import { NestFactory } from '@nestjs/core';
import 'module-alias/register';
import { AppModule } from './app.module';
import { listenProcessEventsBlockml } from './functions/listen-process-events-blockml';
import { logToConsoleBlockml } from './functions/log-to-console-blockml';

async function bootstrap() {
  logToConsoleBlockml(`NODE_ENV is set to "${process.env.NODE_ENV}"`);

  listenProcessEventsBlockml();

  const app = await NestFactory.create(AppModule);

  await app.listen(process.env.LISTEN_PORT || 3001);
}
bootstrap();
