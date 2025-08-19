import test from 'ava';

import { logToConsoleBackend } from '~backend/functions/log-to-console-backend';
import { prepareTestAndSeed } from '~backend/functions/prepare-test';

let testId = 'backend-set-user-name__ok';

let traceId = testId;

let email = `${testId}@example.com`;
let password = '123456';
let firstName = 'John';
let lastName = 'Smith';

let prep: interfaces.Prep;

test('1', async t => {
  let resp: apiToBackend.ToBackendSetUserNameResponse;

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

    let setUserNameReq: apiToBackend.ToBackendSetUserNameRequest = {
      info: {
        name: apiToBackend.ToBackendRequestInfoNameEnum.ToBackendSetUserName,
        traceId: traceId,
        idempotencyKey: makeId()
      },
      payload: {
        firstName: firstName,
        lastName: lastName
      }
    };

    resp = await sendToBackend<apiToBackend.ToBackendSetUserNameResponse>({
      httpServer: prep.httpServer,
      loginToken: prep.loginToken,
      req: setUserNameReq
    });

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
  t.is(resp.payload.user.firstName, firstName);
  t.is(resp.payload.user.lastName, lastName);
});
