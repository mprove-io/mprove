import test from 'ava';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { helper } from '~backend/barrels/helper';
import { interfaces } from '~backend/barrels/interfaces';
import { prepareTest } from '~backend/functions/prepare-test';

let testId = 'register-user__user-already-registered';

let traceId = testId;
let email = `${testId}@example.com`;
let password = '123';
let prep: interfaces.Prep;

test('1', async t => {
  let resp: apiToBackend.ToBackendRegisterUserResponse;

  try {
    prep = await prepareTest({
      traceId: traceId,
      deleteRecordsPayload: { emails: [email] },
      seedRecordsPayload: {
        users: [
          {
            email: email,
            password: password,
            isEmailVerified: common.BoolEnum.FALSE,
            passwordResetToken: helper.makeId(),
            emailVerificationToken: helper.makeId()
          }
        ]
      }
    });

    resp = await helper.sendToBackend<apiToBackend.ToBackendRegisterUserResponse>(
      {
        httpServer: prep.httpServer,
        req: <apiToBackend.ToBackendRegisterUserRequest>{
          info: {
            name:
              apiToBackend.ToBackendRequestInfoNameEnum.ToBackendRegisterUser,
            traceId: traceId
          },
          payload: {
            email: email,
            password: password
          }
        }
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
