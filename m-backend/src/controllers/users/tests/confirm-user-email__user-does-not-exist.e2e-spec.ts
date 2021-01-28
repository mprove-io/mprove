import test from 'ava';
import { api } from '~/barrels/api';
import { helper } from '~/barrels/helper';
import { interfaces } from '~/barrels/interfaces';
import { prepareTest } from '~/functions/prepare-test';

let testId = 'confirm-user-email__user-does-not-exist';

let traceId = testId;
let userId = `${testId}@example.com`;
let token = helper.makeId();
let prep: interfaces.Prep;

test('1', async t => {
  let resp: api.ToBackendConfirmUserEmailResponse;

  try {
    prep = await prepareTest({
      traceId: traceId,
      deleteRecordsPayload: { userIds: [userId] }
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

  t.is(resp.info.error.message, api.ErEnum.M_BACKEND_USER_DOES_NOT_EXIST);
});
