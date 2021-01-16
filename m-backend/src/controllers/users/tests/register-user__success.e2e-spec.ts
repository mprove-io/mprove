import { api } from '../../../barrels/api';
import { prepareTest } from '../../../functions/prepare-test';
import { interfaces } from '../../../barrels/interfaces';
import * as request from 'supertest';
import test from 'ava';

let traceId = '123';
let userId = 'john@example.com';
let password = '456';

test('register-user__success', async t => {
  let prep: interfaces.Prep;
  let response: request.Response;

  let target: api.ToBackendRegisterUserResponse = {
    info: {
      status: api.ResponseInfoStatusEnum.Ok,
      traceId: traceId
    },
    payload: {
      userId: userId
    }
  };

  try {
    prep = await prepareTest();

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

    response = await request(prep.httpServer)
      .post('/' + registerUserRequest.info.name)
      .send(registerUserRequest);

    await prep.app.close();
  } catch (e) {
    api.logToConsole(e);
  }
  t.deepEqual(response.body, target);
});
