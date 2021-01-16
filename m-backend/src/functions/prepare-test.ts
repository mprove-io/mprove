import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../app.module';
import { interfaces } from '../barrels/interfaces';
import { api } from '../barrels/api';
import { ToBackendDeleteRecordsRequestPayload } from '../api/_index';

import * as request from 'supertest';

export async function prepareTest(item: {
  traceId: string;
  deleteRecordsPayload: ToBackendDeleteRecordsRequestPayload;
}) {
  let app: INestApplication;

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule]
  }).compile();

  app = moduleFixture.createNestApplication();

  await app.init();

  let httpServer = app.getHttpServer();

  let deleteRecordsRequest: api.ToBackendDeleteRecordsRequest = {
    info: {
      name: api.ToBackendRequestInfoNameEnum.ToBackendDeleteRecords,
      traceId: item.traceId
    },
    payload: item.deleteRecordsPayload
  };

  await request(httpServer)
    .post('/' + deleteRecordsRequest.info.name)
    .send(deleteRecordsRequest);

  let prep: interfaces.Prep = { app, httpServer, moduleFixture };

  return prep;
}
