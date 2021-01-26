import { NestFactory } from '@nestjs/core';
import 'module-alias/register';
import { AppModule } from './app.module';
import { api } from './barrels/api';

async function bootstrap() {
  api.listenProcessEvents();

  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();
