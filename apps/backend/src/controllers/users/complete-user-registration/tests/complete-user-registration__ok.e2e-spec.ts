import test from 'ava';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { helper } from '~backend/barrels/helper';
import { interfaces } from '~backend/barrels/interfaces';
import { logToConsoleBackend } from '~backend/functions/log-to-console-backend';
import { prepareTestAndSeed } from '~backend/functions/prepare-test';

let testId = 'backend-complete-user-registration__ok';

let traceId = testId;

let email = `${testId}@example.com`;
let emailToken = common.makeId();
let newPassword = '456';

let prep: interfaces.Prep;

test('1', async t => {
  let resp: apiToBackend.ToBackendCompleteUserRegistrationResponse;

  try {
    prep = await prepareTestAndSeed({
      traceId: traceId,
      deleteRecordsPayload: {
        emails: [email]
      },
      seedRecordsPayload: {
        users: [
          {
            email: email,
            isEmailVerified: false,
            emailVerificationToken: emailToken
          }
        ]
      }
    });

    let completeUserRegistrationReq: apiToBackend.ToBackendCompleteUserRegistrationRequest =
      {
        info: {
          name: apiToBackend.ToBackendRequestInfoNameEnum
            .ToBackendCompleteUserRegistration,
          traceId: traceId,
          idempotencyKey: common.makeId()
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
          req: completeUserRegistrationReq
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
  t.is(resp.info.status, common.ResponseInfoStatusEnum.Ok);
});
