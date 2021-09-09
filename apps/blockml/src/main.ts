import { NestFactory } from '@nestjs/core';
import 'module-alias/register';
import { AppModule } from './app.module';
import { common } from './barrels/common';

async function bootstrap() {
  console.log(`NODE_ENV is set to "${process.env.NODE_ENV}"`);

  common.listenProcessEvents();

  const app = await NestFactory.create(AppModule);
  await app.listen(3001);
}
bootstrap();
