import test from 'ava';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { helper } from '~backend/barrels/helper';
import { interfaces } from '~backend/barrels/interfaces';
import { logToConsoleBackend } from '~backend/functions/log-to-console-backend';
import { prepareTestAndSeed } from '~backend/functions/prepare-test';

let testId = 'backend-get-user-profile__unauthorized';

let traceId = testId;

let email = `${testId}@example.com`;
let password = '123456';

let prep: interfaces.Prep;

test('1', async t => {
  let resp: apiToBackend.ToBackendGetUserProfileResponse;

  try {
    prep = await prepareTestAndSeed({
      traceId: traceId,
      deleteRecordsPayload: {
        emails: [email]
      },
      seedRecordsPayload: {
        users: [
          {
            email,
            password,
            isEmailVerified: true
          }
        ]
      }
    });

    let getUserProfileReq: apiToBackend.ToBackendGetUserProfileRequest = {
      info: {
        name: apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetUserProfile,
        traceId: traceId,
        idempotencyKey: common.makeId()
      },
      payload: {}
    };

    resp =
      await helper.sendToBackend<apiToBackend.ToBackendGetUserProfileResponse>({
        httpServer: prep.httpServer,
        req: getUserProfileReq
      });

    await prep.app.close();
  } catch (e) {
    logToConsoleBackend({
      log: e,
      logLevel: common.LogLevelEnum.Error,
      logger: prep.logger,
      cs: prep.cs
    });
  }

  t.is(resp?.info?.error?.message, common.ErEnum.BACKEND_UNAUTHORIZED);
});
