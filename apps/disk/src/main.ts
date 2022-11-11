import { NestFactory } from '@nestjs/core';
import 'module-alias/register';
import { AppModule } from './app.module';
import { listenProcessEventsDisk } from './functions/listen-process-events-disk';
import { logToConsoleDisk } from './functions/log-to-console-disk';

async function bootstrap() {
  logToConsoleDisk(`NODE_ENV is set to "${process.env.NODE_ENV}"`);

  listenProcessEventsDisk();

  const app = await NestFactory.create(AppModule);

  await app.listen(process.env.LISTEN_PORT || 3002);
}
bootstrap();
