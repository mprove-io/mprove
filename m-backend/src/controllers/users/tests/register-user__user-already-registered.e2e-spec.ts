import test from 'ava';
import { api } from '~/barrels/api';
import { helper } from '~/barrels/helper';
import { interfaces } from '~/barrels/interfaces';
import { prepareTest } from '~/functions/prepare-test';

let testId = 'register-user__user-already-registered';

let traceId = testId;
let email = `${testId}@example.com`;
let password = '123';
let prep: interfaces.Prep;

test('1', async t => {
  let resp: api.ToBackendRegisterUserResponse;

  try {
    prep = await prepareTest({
      traceId: traceId,
      deleteRecordsPayload: { emails: [email] },
      seedRecordsPayload: {
        users: [
          {
            email: email,
            password: password,
            isEmailVerified: api.BoolEnum.FALSE,
            passwordResetToken: helper.makeId(),
            emailVerificationToken: helper.makeId()
          }
        ]
      }
    });

    resp = await helper.sendToBackend<api.ToBackendRegisterUserResponse>({
      httpServer: prep.httpServer,
      req: <api.ToBackendRegisterUserRequest>{
        info: {
          name: api.ToBackendRequestInfoNameEnum.ToBackendRegisterUser,
          traceId: traceId
        },
        payload: {
          email: email,
          password: password
        }
      }
    });

    await prep.app.close();
  } catch (e) {
    api.logToConsole(e);
  }

  t.is(resp.info.error.message, api.ErEnum.M_BACKEND_USER_ALREADY_REGISTERED);
});
