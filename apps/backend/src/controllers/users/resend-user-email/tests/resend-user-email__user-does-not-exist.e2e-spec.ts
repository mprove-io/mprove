import test from 'ava';

import { logToConsoleBackend } from '~backend/functions/log-to-console-backend';
import { prepareTestAndSeed } from '~backend/functions/prepare-test';

let testId = 'resend-user-email__user-does-not-exist';

let traceId = testId;

let userId = makeId();
let email = `${testId}@example.com`;
let password = '123456';

let prep: interfaces.Prep;

test('1', async t => {
  let resp: apiToBackend.ToBackendResendUserEmailResponse;

  try {
    prep = await prepareTestAndSeed({
      traceId: traceId,
      deleteRecordsPayload: {
        emails: [email]
      }
    });

    let resendUserEmailReq: apiToBackend.ToBackendResendUserEmailRequest = {
      info: {
        name: apiToBackend.ToBackendRequestInfoNameEnum
          .ToBackendResendUserEmail,
        traceId: traceId,
        idempotencyKey: makeId()
      },
      payload: {
        userId: userId
      }
    };

    resp = await sendToBackend<apiToBackend.ToBackendResendUserEmailResponse>({
      httpServer: prep.httpServer,
      req: resendUserEmailReq
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

  t.is(resp.info.error.message, ErEnum.BACKEND_USER_DOES_NOT_EXIST);
});
