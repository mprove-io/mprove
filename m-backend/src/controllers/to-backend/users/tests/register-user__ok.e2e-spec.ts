import { api } from '../../../../barrels/api';
import { prepareTest } from '../../../../functions/prepare-test';
import { interfaces } from '../../../../barrels/interfaces';
import * as request from 'supertest';
import test from 'ava';

let testId = 'register-user__success';

let traceId = '123';
let userId = `${testId}@example.com`;
let password = '456';

let prep: interfaces.Prep;

test('1', async t => {
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
    prep = await prepareTest({
      traceId: traceId,
      deleteRecordsPayload: { userIds: [userId] }
    });

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
