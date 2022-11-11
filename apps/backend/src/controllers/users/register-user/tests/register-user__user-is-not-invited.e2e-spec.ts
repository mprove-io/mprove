import test from 'ava';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { helper } from '~backend/barrels/helper';
import { interfaces } from '~backend/barrels/interfaces';
import { logToConsoleBackend } from '~backend/functions/log-to-console-backend';
import { prepareTest } from '~backend/functions/prepare-test';

let testId = 'backend-register-user__user-is-not-invited';

let traceId = testId;

let email = `${testId}@example.com`;
let password = '123456';

let prep: interfaces.Prep;

test('1', async t => {
  let resp: apiToBackend.ToBackendRegisterUserResponse;

  try {
    prep = await prepareTest({
      traceId: traceId,
      deleteRecordsPayload: {
        idempotencyKeys: [testId],
        emails: [email]
      },
      overrideConfigOptions: {
        registerOnlyInvitedUsers: common.BoolEnum.TRUE
      }
    });

    let registerUserReq: apiToBackend.ToBackendRegisterUserRequest = {
      info: {
        name: apiToBackend.ToBackendRequestInfoNameEnum.ToBackendRegisterUser,
        traceId: traceId,
        idempotencyKey: testId
      },
      payload: {
        email: email,
        password: password
      }
    };

    resp =
      await helper.sendToBackend<apiToBackend.ToBackendRegisterUserResponse>({
        httpServer: prep.httpServer,
        req: registerUserReq
      });

    await prep.app.close();
  } catch (e) {
    logToConsoleBackend(e);
  }

  t.is(resp.info.error.message, common.ErEnum.BACKEND_USER_IS_NOT_INVITED);
});
