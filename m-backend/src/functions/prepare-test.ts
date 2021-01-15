import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../src/app.module';

export async function prepareTest() {
  let app: INestApplication;

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule]
  }).compile();

  app = moduleFixture.createNestApplication();
  await app.init();
  let httpServer = app.getHttpServer();

  return { app, httpServer };
}
