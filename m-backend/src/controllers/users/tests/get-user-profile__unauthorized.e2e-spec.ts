import test from 'ava';
import { api } from '~/barrels/api';
import { helper } from '~/barrels/helper';
import { interfaces } from '~/barrels/interfaces';
import { prepareTest } from '~/functions/prepare-test';

let testId = 'get-user-profile__unauthorized';

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
      }
    });

    resp = await helper.sendToBackend<api.ToBackendGetUserProfileResponse>({
      httpServer: prep.httpServer,
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

  t.is(resp?.info?.error?.message, api.ErEnum.M_BACKEND_UNAUTHORIZED);
});
