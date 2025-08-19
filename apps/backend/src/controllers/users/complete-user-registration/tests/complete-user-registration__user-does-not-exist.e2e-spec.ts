import test from 'ava';

import { logToConsoleBackend } from '~backend/functions/log-to-console-backend';
import { prepareTestAndSeed } from '~backend/functions/prepare-test';

let testId = 'backend-confirm-user-email__user-does-not-exist';

let traceId = testId;
let emailToken = makeId();

let newPassword = '456';

let prep: interfaces.Prep;

test('1', async t => {
  let resp: apiToBackend.ToBackendCompleteUserRegistrationResponse;

  try {
    prep = await prepareTestAndSeed({
      traceId: traceId,
      deleteRecordsPayload: {}
    });

    let completeUserRegistrationRequest: apiToBackend.ToBackendCompleteUserRegistrationRequest =
      {
        info: {
          name: apiToBackend.ToBackendRequestInfoNameEnum
            .ToBackendCompleteUserRegistration,
          traceId: traceId,
          idempotencyKey: makeId()
        },
        payload: {
          emailConfirmationToken: emailToken,
          newPassword: newPassword
        }
      };

    resp =
      await sendToBackend<apiToBackend.ToBackendCompleteUserRegistrationResponse>(
        {
          httpServer: prep.httpServer,
          req: completeUserRegistrationRequest
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

  t.is(resp.info.error.message, ErEnum.BACKEND_USER_DOES_NOT_EXIST);
});
