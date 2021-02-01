import test from 'ava';
import { api } from '~backend/barrels/api';
import { helper } from '~backend/barrels/helper';
import { interfaces } from '~backend/barrels/interfaces';
import { prepareTest } from '~backend/functions/prepare-test';

let testId = 'login-user__wrong-password';

let traceId = testId;
let email = `${testId}@example.com`;
let password = '123';
let wrongPassword = '456';
let prep: interfaces.Prep;

test('1', async t => {
  let resp: api.ToBackendLoginUserResponse;

  try {
    prep = await prepareTest({
      traceId: traceId,
      deleteRecordsPayload: { emails: [email] },
      seedRecordsPayload: {
        users: [
          {
            email: email,
            password: password,
            isEmailVerified: api.BoolEnum.TRUE
          }
        ]
      }
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
          password: wrongPassword
        }
      }
    });

    await prep.app.close();
  } catch (e) {
    api.logToConsole(e);
  }

  t.is(resp.info.error.message, api.ErEnum.M_BACKEND_WRONG_PASSWORD);
});
