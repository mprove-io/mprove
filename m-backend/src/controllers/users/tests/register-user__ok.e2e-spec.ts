import test from 'ava';
import { api } from '~/barrels/api';
import { helper } from '~/barrels/helper';
import { interfaces } from '~/barrels/interfaces';
import { prepareTest } from '~/functions/prepare-test';

let testId = 'register-user__ok';

let traceId = testId;
let userId = `${testId}@example.com`;
let password = '123';
let prep: interfaces.Prep;

test('1', async t => {
  let resp: api.ToBackendRegisterUserResponse;

  try {
    prep = await prepareTest({
      traceId: traceId,
      deleteRecordsPayload: { userIds: [userId] }
    });

    resp = await helper.sendToBackend<api.ToBackendRegisterUserResponse>({
      httpServer: prep.httpServer,
      req: <api.ToBackendRegisterUserRequest>{
        info: {
          name: api.ToBackendRequestInfoNameEnum.ToBackendRegisterUser,
          traceId: traceId
        },
        payload: {
          userId: userId,
          password: password
        }
      }
    });

    await prep.app.close();
  } catch (e) {
    api.logToConsole(e);
  }

  t.deepEqual(resp, <api.ToBackendRegisterUserResponse>{
    info: {
      status: api.ResponseInfoStatusEnum.Ok,
      traceId: traceId
    },
    payload: {
      userId: userId
    }
  });
});
