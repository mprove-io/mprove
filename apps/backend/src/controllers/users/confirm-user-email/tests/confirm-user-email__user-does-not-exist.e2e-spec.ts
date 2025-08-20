import test from 'ava';
import { logToConsoleBackend } from '~backend/functions/log-to-console-backend';
import { prepareTestAndSeed } from '~backend/functions/prepare-test';

let testId = 'backend-confirm-user-email__user-does-not-exist';

let traceId = testId;
let emailToken = makeId();

let prep: Prep;

test('1', async t => {
  let resp: ToBackendConfirmUserEmailResponse;

  try {
    prep = await prepareTestAndSeed({
      traceId: traceId,
      deleteRecordsPayload: {}
    });

    let confirmUserEmailRequest: ToBackendConfirmUserEmailRequest = {
      info: {
        name: ToBackendRequestInfoNameEnum.ToBackendConfirmUserEmail,
        traceId: traceId,
        idempotencyKey: makeId()
      },
      payload: {
        token: emailToken
      }
    };

    resp = await sendToBackend<ToBackendConfirmUserEmailResponse>({
      httpServer: prep.httpServer,
      req: confirmUserEmailRequest
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
