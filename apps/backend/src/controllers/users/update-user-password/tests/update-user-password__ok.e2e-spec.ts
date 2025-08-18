import test from 'ava';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { helper } from '~backend/barrels/helper';
import { interfaces } from '~backend/barrels/interfaces';
import { logToConsoleBackend } from '~backend/functions/log-to-console-backend';
import { prepareTestAndSeed } from '~backend/functions/prepare-test';

let testId = 'backend-update-user-password__ok';

let traceId = testId;

let email = `${testId}@example.com`;
let password = '123456';
let newPassword = '456';
let passwordResetToken = 'jf29734j57293458';

let prep: interfaces.Prep;

test('1', async t => {
  let resp: apiToBackend.ToBackendUpdateUserPasswordResponse;

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
            isEmailVerified: true,
            passwordResetToken
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
          idempotencyKey: common.makeId()
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
    logToConsoleBackend({
      log: e,
      logLevel: common.LogLevelEnum.Error,
      logger: prep.logger,
      cs: prep.cs
    });
  }

  t.is(resp.info.error, undefined);
});
