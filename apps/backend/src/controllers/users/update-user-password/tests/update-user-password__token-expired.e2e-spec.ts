import test from 'ava';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { helper } from '~backend/barrels/helper';
import { interfaces } from '~backend/barrels/interfaces';
import { logToConsoleBackend } from '~backend/functions/log-to-console-backend';
import { prepareTest } from '~backend/functions/prepare-test';

let testId = 'backend-update-user-password__token-expired';

let traceId = testId;

let email = `${testId}@example.com`;
let password = '123456';
let newPassword = '456';
let passwordResetToken = 'dj293d4958734d95';
let expiredPasswordResetExpiresTs = '1';

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
            passwordResetToken,
            passwordResetExpiresTs: expiredPasswordResetExpiresTs
          }
        ]
      }
    });

    let updateUserPasswordReq: apiToBackend.ToBackendUpdateUserPasswordRequest =
      {
        info: {
          name: apiToBackend.ToBackendRequestInfoNameEnum
            .ToBackendUpdateUserPassword,
          traceId: traceId,
          idempotencyKey: testId
        },
        payload: {
          passwordResetToken,
          newPassword
        }
      };

    resp =
      await helper.sendToBackend<apiToBackend.ToBackendUpdateUserPasswordResponse>(
        {
          httpServer: prep.httpServer,
          loginToken: prep.loginToken,
          req: updateUserPasswordReq
        }
      );

    await prep.app.close();
  } catch (e) {
    logToConsoleBackend(e);
  }

  t.is(
    resp.info.error.message,
    common.ErEnum.BACKEND_UPDATE_PASSWORD_TOKEN_EXPIRED
  );
});
