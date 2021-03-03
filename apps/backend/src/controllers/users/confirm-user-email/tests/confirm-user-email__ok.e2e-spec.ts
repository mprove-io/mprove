import test from 'ava';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { helper } from '~backend/barrels/helper';
import { interfaces } from '~backend/barrels/interfaces';
import { prepareTest } from '~backend/functions/prepare-test';

let testId = 'backend-confirm-user-email__ok';

let traceId = testId;
let email = `${testId}@example.com`;
let emailToken = common.makeId();
let prep: interfaces.Prep;

test('1', async t => {
  let resp: apiToBackend.ToBackendConfirmUserEmailResponse;

  try {
    prep = await prepareTest({
      traceId: traceId,
      deleteRecordsPayload: { emails: [email] },
      seedRecordsPayload: {
        users: [
          {
            email: email,
            isEmailVerified: common.BoolEnum.FALSE,
            emailVerificationToken: emailToken
          }
        ]
      }
    });

    let confirmUserEmailReq: apiToBackend.ToBackendConfirmUserEmailRequest = {
      info: {
        name:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendConfirmUserEmail,
        traceId: traceId
      },
      payload: {
        token: emailToken
      }
    };

    resp = await helper.sendToBackend<apiToBackend.ToBackendConfirmUserEmailResponse>(
      {
        httpServer: prep.httpServer,
        req: confirmUserEmailReq
      }
    );

    await prep.app.close();
  } catch (e) {
    common.logToConsole(e);
  }

  t.is(resp.info.error, undefined);
  t.is(resp.info.status, common.ResponseInfoStatusEnum.Ok);
});
