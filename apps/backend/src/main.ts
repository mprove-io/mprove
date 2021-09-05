import { NestFactory } from '@nestjs/core';
import { json, urlencoded } from 'body-parser';
import 'module-alias/register';
import { AppModule } from './app.module';
import { common } from './barrels/common';

async function bootstrap() {
  common.listenProcessEvents();

  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ limit: '50mb', extended: true }));
  app.enableCors();
  await app.listen(3000);
}
bootstrap();
