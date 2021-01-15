import { api } from '../../../barrels/api';
import { prepareTest } from '../../../functions/prepare-test';
import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';

let traceId = '123';
let userId = 'john@example.com';
let password = '123';

let app: INestApplication;
let httpServer;
let resp;
let responsePayload: api.ToBackendRegisterUserResponsePayload = {
  userId: userId
};

beforeEach(async () => {
  let prep = await prepareTest();
  app = prep.app;
  httpServer = prep.httpServer;
});

afterAll(async () => {
  await app.close();
});

test('1', async () => {
  try {
    let registerUserRequest: api.ToBackendRegisterUserRequest = {
      info: {
        name: api.ToBackendRequestInfoNameEnum.ToBackendRegisterUser,
        traceId: traceId
      },
      payload: {
        userId: userId,
        password: password
      }
    };

    resp = await request(httpServer)
      .post('/' + registerUserRequest.info.name)
      .send(registerUserRequest);
  } catch (e) {
    api.logToConsole(e);
  }

  expect(resp.body.payload).toStrictEqual(responsePayload);
});
