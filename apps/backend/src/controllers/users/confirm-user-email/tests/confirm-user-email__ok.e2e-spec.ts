import test from 'ava';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { helper } from '~backend/barrels/helper';
import { interfaces } from '~backend/barrels/interfaces';
import { logToConsoleBackend } from '~backend/functions/log-to-console-backend';
import { prepareTest } from '~backend/functions/prepare-test';

let testId = 'backend-confirm-user-email__ok';

let traceId = testId;

let email = `${testId}@example.com`;
let emailToken = common.makeId();
let password = '123456';

let prep: interfaces.Prep;

test('1', async t => {
  let resp: apiToBackend.ToBackendConfirmUserEmailResponse;

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
            password: password,
            isEmailVerified: common.BoolEnum.FALSE,
            emailVerificationToken: emailToken
          }
        ]
      }
    });

    let confirmUserEmailReq: apiToBackend.ToBackendConfirmUserEmailRequest = {
      info: {
        name: apiToBackend.ToBackendRequestInfoNameEnum
          .ToBackendConfirmUserEmail,
        traceId: traceId,
        idempotencyKey: testId
      },
      payload: {
        token: emailToken
      }
    };

    resp =
      await helper.sendToBackend<apiToBackend.ToBackendConfirmUserEmailResponse>(
        {
          httpServer: prep.httpServer,
          req: confirmUserEmailReq
        }
      );

    await prep.app.close();
  } catch (e) {
    logToConsoleBackend(e);
  }

  t.is(resp.info.error, undefined);
  t.is(resp.info.status, common.ResponseInfoStatusEnum.Ok);
});
