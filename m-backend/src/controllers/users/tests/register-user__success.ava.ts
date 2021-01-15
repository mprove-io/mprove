import { api } from '../../../barrels/api';
import { prepareTest } from '../../../functions/prepare-test';
import * as request from 'supertest';
import test from 'ava';

let traceId = '123';
let userId = 'john@example.com';
let password = '456';

test('register-user__success', async t => {
  let { httpServer, app } = await prepareTest();

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

  let response;
  let payload: api.ToBackendRegisterUserResponsePayload = {
    userId: userId
  };

  try {
    response = await request(httpServer)
      .post('/' + registerUserRequest.info.name)
      .send(registerUserRequest);
    await app.close();
  } catch (e) {
    api.logToConsole(e);
  }
  t.is(response.body.info.status, api.ResponseInfoStatusEnum.Ok);
  t.deepEqual(response.body.payload, payload);
});
