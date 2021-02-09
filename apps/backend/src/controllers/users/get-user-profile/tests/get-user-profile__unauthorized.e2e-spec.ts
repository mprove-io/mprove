import test from 'ava';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { helper } from '~backend/barrels/helper';
import { interfaces } from '~backend/barrels/interfaces';
import { prepareTest } from '~backend/functions/prepare-test';

let testId = 'get-user-profile__unauthorized';

let traceId = testId;
let email = `${testId}@example.com`;
let password = '123';
let prep: interfaces.Prep;

test('1', async t => {
  let resp: apiToBackend.ToBackendGetUserProfileResponse;

  try {
    prep = await prepareTest({
      traceId: traceId,
      deleteRecordsPayload: { emails: [email] },
      seedRecordsPayload: {
        users: [
          {
            email,
            password,
            isEmailVerified: common.BoolEnum.TRUE
          }
        ]
      }
    });

    resp = await helper.sendToBackend<apiToBackend.ToBackendGetUserProfileResponse>(
      {
        httpServer: prep.httpServer,
        req: <apiToBackend.ToBackendGetUserProfileRequest>{
          info: {
            name:
              apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetUserProfile,
            traceId: traceId
          },
          payload: {}
        }
      }
    );

    await prep.app.close();
  } catch (e) {
    common.logToConsole(e);
  }

  t.is(resp?.info?.error?.message, apiToBackend.ErEnum.BACKEND_UNAUTHORIZED);
});