import test from 'ava';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { helper } from '~backend/barrels/helper';
import { interfaces } from '~backend/barrels/interfaces';
import { prepareTest } from '~backend/functions/prepare-test';

let testId = 'backend-register-user__user-already-registered';

let traceId = testId;

let email = `${testId}@example.com`;
let password = '123';

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
      seedRecordsPayload: {
        users: [
          {
            email: email,
            password: password,
            isEmailVerified: common.BoolEnum.FALSE,
            passwordResetToken: common.makeId(),
            emailVerificationToken: common.makeId()
          }
        ]
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

    resp = await helper.sendToBackend<apiToBackend.ToBackendRegisterUserResponse>(
      {
        httpServer: prep.httpServer,
        req: registerUserReq
      }
    );

    await prep.app.close();
  } catch (e) {
    common.logToConsole(e);
  }

  t.is(
    resp.info.error.message,
    apiToBackend.ErEnum.BACKEND_USER_ALREADY_REGISTERED
  );
});
