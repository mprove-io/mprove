import test from 'ava';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { helper } from '~backend/barrels/helper';
import { interfaces } from '~backend/barrels/interfaces';
import { prepareTest } from '~backend/functions/prepare-test';

let testId = 'login-user__register-to-set-password';

let traceId = testId;
let email = `${testId}@example.com`;
let password = '123';
let prep: interfaces.Prep;

test('1', async t => {
  let resp: apiToBackend.ToBackendLoginUserResponse;

  try {
    prep = await prepareTest({
      traceId: traceId,
      deleteRecordsPayload: { emails: [email] },
      seedRecordsPayload: {
        users: [
          {
            email: email,
            isEmailVerified: common.BoolEnum.FALSE
          }
        ]
      }
    });

    resp = await helper.sendToBackend<apiToBackend.ToBackendLoginUserResponse>({
      httpServer: prep.httpServer,
      req: <apiToBackend.ToBackendLoginUserRequest>{
        info: {
          name: apiToBackend.ToBackendRequestInfoNameEnum.ToBackendLoginUser,
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
    common.logToConsole(e);
  }

  t.is(
    resp.info.error.message,
    apiToBackend.ErEnum.BACKEND_REGISTER_TO_SET_PASSWORD
  );
});
