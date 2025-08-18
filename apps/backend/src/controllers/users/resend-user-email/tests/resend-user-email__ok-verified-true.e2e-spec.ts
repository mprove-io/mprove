import test from 'ava';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { helper } from '~backend/barrels/helper';
import { interfaces } from '~backend/barrels/interfaces';
import { logToConsoleBackend } from '~backend/functions/log-to-console-backend';
import { prepareTestAndSeed } from '~backend/functions/prepare-test';

let testId = 'resend-user-email__ok-verified-true';

let traceId = testId;

let userId = common.makeId();
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
      },
      seedRecordsPayload: {
        users: [
          {
            userId: userId,
            email: email,
            password: password,
            isEmailVerified: true
          }
        ]
      }
    });

    let resendUserEmailReq: apiToBackend.ToBackendResendUserEmailRequest = {
      info: {
        name: apiToBackend.ToBackendRequestInfoNameEnum
          .ToBackendResendUserEmail,
        traceId: traceId,
        idempotencyKey: common.makeId()
      },
      payload: {
        userId: userId
      }
    };

    resp =
      await helper.sendToBackend<apiToBackend.ToBackendResendUserEmailResponse>(
        {
          httpServer: prep.httpServer,
          req: resendUserEmailReq
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
  t.is(resp.payload.isEmailVerified, true);
});
