import test from 'ava';
import { api } from '~backend/barrels/api';
import { helper } from '~backend/barrels/helper';
import { interfaces } from '~backend/barrels/interfaces';
import { prepareTest } from '~backend/functions/prepare-test';

let testId = 'get-user-profile__ok';

let traceId = testId;
let email = `${testId}@example.com`;
let password = '123';
let prep: interfaces.Prep;

test('1', async t => {
  let resp: api.ToBackendGetUserProfileResponse;

  try {
    prep = await prepareTest({
      traceId: traceId,
      deleteRecordsPayload: { emails: [email] },
      seedRecordsPayload: {
        users: [
          {
            email,
            password,
            isEmailVerified: api.BoolEnum.TRUE
          }
        ]
      },
      loginUserPayload: { email, password }
    });

    resp = await helper.sendToBackend<api.ToBackendGetUserProfileResponse>({
      httpServer: prep.httpServer,
      loginToken: prep.loginToken,
      req: <api.ToBackendGetUserProfileRequest>{
        info: {
          name: api.ToBackendRequestInfoNameEnum.ToBackendGetUserProfile,
          traceId: traceId
        },
        payload: {}
      }
    });

    await prep.app.close();
  } catch (e) {
    api.logToConsole(e);
  }

  t.is(resp.info.error, undefined);
  t.is(resp.info.status, api.ResponseInfoStatusEnum.Ok);
});
