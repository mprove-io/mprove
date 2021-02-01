import test from 'ava';
import { api } from '~backend/barrels/api';
import { helper } from '~backend/barrels/helper';
import { interfaces } from '~backend/barrels/interfaces';
import { prepareTest } from '~backend/functions/prepare-test';

let testId = 'confirm-user-email__ok';

let traceId = testId;
let email = `${testId}@example.com`;
let emailToken = helper.makeId();
let prep: interfaces.Prep;

test('1', async t => {
  let resp: api.ToBackendConfirmUserEmailResponse;

  try {
    prep = await prepareTest({
      traceId: traceId,
      deleteRecordsPayload: { emails: [email] },
      seedRecordsPayload: {
        users: [
          {
            email: email,
            isEmailVerified: api.BoolEnum.FALSE,
            emailVerificationToken: emailToken
          }
        ]
      }
    });

    resp = await helper.sendToBackend<api.ToBackendConfirmUserEmailResponse>({
      httpServer: prep.httpServer,
      req: <api.ToBackendConfirmUserEmailRequest>{
        info: {
          name: api.ToBackendRequestInfoNameEnum.ToBackendConfirmUserEmail,
          traceId: traceId
        },
        payload: {
          token: emailToken
        }
      }
    });

    await prep.app.close();
  } catch (e) {
    api.logToConsole(e);
  }

  t.deepEqual(resp, <api.ToBackendConfirmUserEmailResponse>{
    info: {
      status: api.ResponseInfoStatusEnum.Ok,
      traceId: traceId
    },
    payload: {}
  });
});
