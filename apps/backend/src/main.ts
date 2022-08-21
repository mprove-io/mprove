import { NestFactory } from '@nestjs/core';
import { json, urlencoded } from 'body-parser';
import 'module-alias/register';
import { AppModule } from './app.module';
import { common } from './barrels/common';

async function bootstrap() {
  console.log(`NODE_ENV is set to "${process.env.NODE_ENV}"`);

  common.listenProcessEvents();

  const app = await NestFactory.create(AppModule);
  // use after nestjs 8
  // app.setGlobalPrefix('api');
  // app.setGlobalPrefix(constants.API_PATH);
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ limit: '50mb', extended: true }));
  app.enableCors();

  await app.listen(process.env.LISTEN_PORT || 3000);
}
bootstrap();
