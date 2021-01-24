import { api } from '../../../barrels/api';
import { prepareTest } from '../../../functions/prepare-test';
import { interfaces } from '../../../barrels/interfaces';
import test from 'ava';
import { helper } from '../../../barrels/helper';

let testId = 'register-user__user-already-registered';

let traceId = '123';
let userId = `${testId}@example.com`;
let password = '456';

let prep: interfaces.Prep;

test('1', async t => {
  let resp: api.ToBackendRegisterUserResponse;

  try {
    prep = await prepareTest({
      traceId: traceId,
      deleteRecordsPayload: { userIds: [userId] },
      seedRecordsPayload: {
        users: [
          {
            userId: userId,
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
          userId: userId,
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
