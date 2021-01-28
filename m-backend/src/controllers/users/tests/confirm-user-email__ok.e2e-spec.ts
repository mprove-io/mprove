import test from 'ava';
import { api } from '~/barrels/api';
import { helper } from '~/barrels/helper';
import { interfaces } from '~/barrels/interfaces';
import { prepareTest } from '~/functions/prepare-test';

let testId = 'confirm-user-email__ok';

let traceId = '123';
let userId = `${testId}@example.com`;

let token = 'SJ8JVTJWN2TWOY2T6ZJH';

let prep: interfaces.Prep;

test('1', async t => {
  let resp: api.ToBackendConfirmUserEmailResponse;

  try {
    prep = await prepareTest({
      traceId: traceId,
      deleteRecordsPayload: { userIds: [userId] },
      seedRecordsPayload: {
        users: [
          {
            userId: userId,
            isEmailVerified: api.BoolEnum.FALSE,
            emailVerificationToken: token
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
          token: token
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
