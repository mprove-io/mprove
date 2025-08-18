import test from 'ava';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { helper } from '~backend/barrels/helper';
import { interfaces } from '~backend/barrels/interfaces';
import { logToConsoleBackend } from '~backend/functions/log-to-console-backend';
import { prepareTestAndSeed } from '~backend/functions/prepare-test';

let testId = 'backend-login-user__ok';

let traceId = testId;

let email = `${testId}@example.com`;
let password = '123456';

let prep: interfaces.Prep;

test('1', async t => {
  let resp: apiToBackend.ToBackendLoginUserResponse;

  try {
    prep = await prepareTestAndSeed({
      traceId: traceId,
      deleteRecordsPayload: {
        emails: [email]
      },
      seedRecordsPayload: {
        users: [
          {
            email: email,
            password: password,
            isEmailVerified: true
          }
        ]
      }
    });

    let loginUserReq: apiToBackend.ToBackendLoginUserRequest = {
      info: {
        name: apiToBackend.ToBackendRequestInfoNameEnum.ToBackendLoginUser,
        traceId: traceId,
        idempotencyKey: common.makeId()
      },
      payload: {
        email: email,
        password: password
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
      logger: prep.logger,
      cs: prep.cs
    });
  }

  t.is(resp.info.error, undefined);
  t.is(resp.info.status, common.ResponseInfoStatusEnum.Ok);
});
