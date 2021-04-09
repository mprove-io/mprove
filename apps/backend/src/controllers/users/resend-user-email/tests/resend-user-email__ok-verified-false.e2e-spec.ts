import test from 'ava';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { helper } from '~backend/barrels/helper';
import { interfaces } from '~backend/barrels/interfaces';
import { prepareTest } from '~backend/functions/prepare-test';

let testId = 'resend-user-email__ok-verified-false';

let traceId = testId;

let userId = common.makeId();
let email = `${testId}@example.com`;
let password = '123';

let prep: interfaces.Prep;

test('1', async t => {
  let resp: apiToBackend.ToBackendResendUserEmailResponse;

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
            userId: userId,
            email: email,
            password: password,
            isEmailVerified: common.BoolEnum.FALSE
          }
        ]
      }
    });

    let resendUserEmailReq: apiToBackend.ToBackendResendUserEmailRequest = {
      info: {
        name:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendResendUserEmail,
        traceId: traceId,
        idempotencyKey: testId
      },
      payload: {
        userId: userId
      }
    };

    resp = await helper.sendToBackend<apiToBackend.ToBackendResendUserEmailResponse>(
      {
        httpServer: prep.httpServer,
        req: resendUserEmailReq
      }
    );

    await prep.app.close();
  } catch (e) {
    common.logToConsole(e);
  }

  t.is(resp.info.error, undefined);
  t.is(resp.info.status, common.ResponseInfoStatusEnum.Ok);
  t.is(resp.payload.isEmailVerified, false);
});
