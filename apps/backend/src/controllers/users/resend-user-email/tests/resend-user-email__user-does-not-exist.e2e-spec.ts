import test from 'ava';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { helper } from '~backend/barrels/helper';
import { interfaces } from '~backend/barrels/interfaces';
import { logToConsoleBackend } from '~backend/functions/log-to-console-backend';
import { prepareTest } from '~backend/functions/prepare-test';

let testId = 'resend-user-email__user-does-not-exist';

let traceId = testId;

let userId = common.makeId();
let email = `${testId}@example.com`;
let password = '123456';

let prep: interfaces.Prep;

test('1', async t => {
  let resp: apiToBackend.ToBackendResendUserEmailResponse;

  try {
    prep = await prepareTest({
      traceId: traceId,
      deleteRecordsPayload: {
        idempotencyKeys: [testId],
        emails: [email]
      }
    });

    let resendUserEmailReq: apiToBackend.ToBackendResendUserEmailRequest = {
      info: {
        name: apiToBackend.ToBackendRequestInfoNameEnum
          .ToBackendResendUserEmail,
        traceId: traceId,
        idempotencyKey: testId
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
      logger: prep.logger
    });
  }

  t.is(resp.info.error.message, common.ErEnum.BACKEND_USER_DOES_NOT_EXIST);
});
