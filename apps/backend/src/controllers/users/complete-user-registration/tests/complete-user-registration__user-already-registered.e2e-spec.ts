import test from 'ava';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { helper } from '~backend/barrels/helper';
import { interfaces } from '~backend/barrels/interfaces';
import { logToConsoleBackend } from '~backend/functions/log-to-console-backend';
import { prepareTest } from '~backend/functions/prepare-test';

let testId = 'backend-confirm-user-email__user-already-registered';

let traceId = testId;

let email = `${testId}@example.com`;
let emailToken = common.makeId();

let newPassword = '456';

let prep: interfaces.Prep;

test('1', async t => {
  let resp: apiToBackend.ToBackendCompleteUserRegistrationResponse;

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
            isEmailVerified: common.BoolEnum.TRUE,
            emailVerificationToken: emailToken
          }
        ]
      }
    });

    let completeUserRegistrationRequest: apiToBackend.ToBackendCompleteUserRegistrationRequest =
      {
        info: {
          name: apiToBackend.ToBackendRequestInfoNameEnum
            .ToBackendCompleteUserRegistration,
          traceId: traceId,
          idempotencyKey: testId
        },
        payload: {
          emailConfirmationToken: emailToken,
          newPassword: newPassword
        }
      };

    resp =
      await helper.sendToBackend<apiToBackend.ToBackendCompleteUserRegistrationResponse>(
        {
          httpServer: prep.httpServer,
          req: completeUserRegistrationRequest
        }
      );

    await prep.app.close();
  } catch (e) {
    logToConsoleBackend({
      log: e,
      logLevel: common.LogLevelEnum.Error,
      pinoLogger: prep.pinoLogger
    });
  }

  t.is(resp.info.error.message, common.ErEnum.BACKEND_USER_ALREADY_REGISTERED);
});
