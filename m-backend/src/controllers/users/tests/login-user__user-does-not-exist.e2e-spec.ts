import test from 'ava';
import { api } from '~/barrels/api';
import { helper } from '~/barrels/helper';
import { interfaces } from '~/barrels/interfaces';
import { prepareTest } from '~/functions/prepare-test';

let testId = 'login-user__user-does-not-exist';

let traceId = testId;
let email = `${testId}@example.com`;
let password = '123';
let prep: interfaces.Prep;

test('1', async t => {
  let resp: api.ToBackendLoginUserResponse;

  try {
    prep = await prepareTest({
      traceId: traceId,
      deleteRecordsPayload: { emails: [email] }
    });

    resp = await helper.sendToBackend<api.ToBackendLoginUserResponse>({
      httpServer: prep.httpServer,
      req: <api.ToBackendLoginUserRequest>{
        info: {
          name: api.ToBackendRequestInfoNameEnum.ToBackendLoginUser,
          traceId: traceId
        },
        payload: {
          email: email,
          password: password
        }
      }
    });

    await prep.app.close();
  } catch (e) {
    api.logToConsole(e);
  }

  t.is(resp.info.error.message, api.ErEnum.M_BACKEND_USER_DOES_NOT_EXIST);
});