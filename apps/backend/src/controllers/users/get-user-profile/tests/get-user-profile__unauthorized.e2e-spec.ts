import test from 'ava';
import { logToConsoleBackend } from '~backend/functions/log-to-console-backend';
import { prepareTestAndSeed } from '~backend/functions/prepare-test';

let testId = 'backend-get-user-profile__unauthorized';

let traceId = testId;

let email = `${testId}@example.com`;
let password = '123456';

let prep: Prep;

test('1', async t => {
  let resp: ToBackendGetUserProfileResponse;

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
      }
    });

    let getUserProfileReq: ToBackendGetUserProfileRequest = {
      info: {
        name: ToBackendRequestInfoNameEnum.ToBackendGetUserProfile,
        traceId: traceId,
        idempotencyKey: makeId()
      },
      payload: {}
    };

    resp = await sendToBackend<ToBackendGetUserProfileResponse>({
      httpServer: prep.httpServer,
      req: getUserProfileReq
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

  t.is(resp?.info?.error?.message, ErEnum.BACKEND_UNAUTHORIZED);
});
