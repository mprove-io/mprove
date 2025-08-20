import test from 'ava';

import { logToConsoleBackend } from '~backend/functions/log-to-console-backend';
import { prepareTestAndSeed } from '~backend/functions/prepare-test';

let testId = 'backend-register-user__user-is-not-invited';

let traceId = testId;

let email = `${testId}@example.com`;
let password = '123456';

let prep: Prep;

test('1', async t => {
  let resp: ToBackendRegisterUserResponse;

  try {
    prep = await prepareTestAndSeed({
      traceId: traceId,
      deleteRecordsPayload: {
        emails: [email]
      },
      overrideConfigOptions: {
        registerOnlyInvitedUsers: BoolEnum.TRUE
      }
    });

    let registerUserReq: ToBackendRegisterUserRequest = {
      info: {
        name: ToBackendRequestInfoNameEnum.ToBackendRegisterUser,
        traceId: traceId,
        idempotencyKey: makeId()
      },
      payload: {
        email: email,
        password: password
      }
    };

    resp = await sendToBackend<ToBackendRegisterUserResponse>({
      httpServer: prep.httpServer,
      req: registerUserReq
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

  t.is(resp.info.error.message, ErEnum.BACKEND_USER_IS_NOT_INVITED);
});
