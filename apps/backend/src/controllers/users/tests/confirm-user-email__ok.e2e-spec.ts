import test from 'ava';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { helper } from '~backend/barrels/helper';
import { interfaces } from '~backend/barrels/interfaces';
import { prepareTest } from '~backend/functions/prepare-test';

let testId = 'confirm-user-email__ok';

let traceId = testId;
let email = `${testId}@example.com`;
let emailToken = helper.makeId();
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

    resp = await helper.sendToBackend<apiToBackend.ToBackendConfirmUserEmailResponse>(
      {
        httpServer: prep.httpServer,
        req: <apiToBackend.ToBackendConfirmUserEmailRequest>{
          info: {
            name:
              apiToBackend.ToBackendRequestInfoNameEnum
                .ToBackendConfirmUserEmail,
            traceId: traceId
          },
          payload: {
            token: emailToken
          }
        }
      }
    );

    await prep.app.close();
  } catch (e) {
    common.logToConsole(e);
  }

  t.deepEqual(resp, <apiToBackend.ToBackendConfirmUserEmailResponse>{
    info: {
      status: common.ResponseInfoStatusEnum.Ok,
      traceId: traceId
    },
    payload: {}
  });
});
