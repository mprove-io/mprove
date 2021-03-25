import test from 'ava';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { helper } from '~backend/barrels/helper';
import { interfaces } from '~backend/barrels/interfaces';
import { prepareTest } from '~backend/functions/prepare-test';

let testId = 'backend-update-user-password__wrong-token';

let traceId = testId;

let email = `${testId}@example.com`;
let password = '123';
let newPassword = '456';
let passwordResetToken = 'fj823984fj589324';
let wrongPasswordResetToken = 'fk230g6epe569';

let prep: interfaces.Prep;

test('1', async t => {
  let resp: apiToBackend.ToBackendUpdateUserPasswordResponse;

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
            email,
            password,
            isEmailVerified: common.BoolEnum.TRUE,
            passwordResetToken
          }
        ]
      },
      loginUserPayload: { email, password }
    });

    let updateUserPasswordReq: apiToBackend.ToBackendUpdateUserPasswordRequest = {
      info: {
        name:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendUpdateUserPassword,
        traceId: traceId,
        idempotencyKey: testId
      },
      payload: {
        passwordResetToken: wrongPasswordResetToken,
        newPassword
      }
    };

    resp = await helper.sendToBackend<apiToBackend.ToBackendUpdateUserPasswordResponse>(
      {
        httpServer: prep.httpServer,
        loginToken: prep.loginToken,
        req: updateUserPasswordReq
      }
    );

    await prep.app.close();
  } catch (e) {
    common.logToConsole(e);
  }

  t.is(
    resp.info.error.message,
    apiToBackend.ErEnum.BACKEND_UPDATE_PASSWORD_WRONG_TOKEN
  );
});
