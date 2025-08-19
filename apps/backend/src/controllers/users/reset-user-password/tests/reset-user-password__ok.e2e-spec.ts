import test from 'ava';

import { logToConsoleBackend } from '~backend/functions/log-to-console-backend';
import { prepareTestAndSeed } from '~backend/functions/prepare-test';

let testId = 'backend-reset-user-password__ok';

let traceId = testId;

let email = `${testId}@example.com`;
let password = '123456';

let prep: interfaces.Prep;

test('1', async t => {
  let resp: apiToBackend.ToBackendResetUserPasswordResponse;

  try {
    prep = await prepareTestAndSeed({
      traceId: traceId,
      deleteRecordsPayload: {
        emails: [email]
      },
      seedRecordsPayload: {
        users: [
          {
            email,
            password,
            isEmailVerified: true
          }
        ]
      },
      loginUserPayload: { email, password }
    });

    let resetUserPasswordReq: apiToBackend.ToBackendResetUserPasswordRequest = {
      info: {
        name: apiToBackend.ToBackendRequestInfoNameEnum
          .ToBackendResetUserPassword,
        traceId: traceId,
        idempotencyKey: makeId()
      },
      payload: { email: email }
    };

    resp = await sendToBackend<apiToBackend.ToBackendResetUserPasswordResponse>(
      {
        httpServer: prep.httpServer,
        loginToken: prep.loginToken,
        req: resetUserPasswordReq
      }
    );

    await prep.app.close();
  } catch (e) {
    logToConsoleBackend({
      log: e,
      logLevel: LogLevelEnum.Error,
      logger: prep.logger,
      cs: prep.cs
    });
  }

  t.is(resp.info.error, undefined);
});
