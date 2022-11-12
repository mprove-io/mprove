import test from 'ava';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { helper } from '~backend/barrels/helper';
import { interfaces } from '~backend/barrels/interfaces';
import { logToConsoleBackend } from '~backend/functions/log-to-console-backend';
import { prepareTest } from '~backend/functions/prepare-test';

let testId = 'backend-login-user__wrong-password';

let traceId = testId;

let email = `${testId}@example.com`;
let password = '123456';
let wrongPassword = '456';

let prep: interfaces.Prep;

test('1', async t => {
  let resp: apiToBackend.ToBackendLoginUserResponse;

  try {
    prep = await prepareTest({
      traceId: traceId,
      deleteRecordsPayload: {
        idempotencyKeys: [testId],
        emails: [email]
      },
      seedRecordsPayload: {
        users: [
          {
            email: email,
            password: password,
            isEmailVerified: common.BoolEnum.TRUE
          }
        ]
      }
    });

    let loginUserReq: apiToBackend.ToBackendLoginUserRequest = {
      info: {
        name: apiToBackend.ToBackendRequestInfoNameEnum.ToBackendLoginUser,
        traceId: traceId,
        idempotencyKey: testId
      },
      payload: {
        email: email,
        password: wrongPassword
      }
    };

    resp = await helper.sendToBackend<apiToBackend.ToBackendLoginUserResponse>({
      httpServer: prep.httpServer,
      req: loginUserReq
    });

    await prep.app.close();
  } catch (e) {
    logToConsoleBackend({
      log: e,
      logLevel: common.LogLevelEnum.Error,
      pinoLogger: prep.pinoLogger
    });
  }

  t.is(resp.info.error.message, common.ErEnum.BACKEND_WRONG_PASSWORD);
});
