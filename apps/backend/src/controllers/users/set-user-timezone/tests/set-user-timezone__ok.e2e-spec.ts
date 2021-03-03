import test from 'ava';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { helper } from '~backend/barrels/helper';
import { interfaces } from '~backend/barrels/interfaces';
import { prepareTest } from '~backend/functions/prepare-test';

let testId = 'backend-set-user-timezone__ok';

let traceId = testId;
let email = `${testId}@example.com`;
let password = '123';
let timezone = common.UTC;
let prep: interfaces.Prep;

test('1', async t => {
  let resp: apiToBackend.ToBackendSetUserTimezoneResponse;

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
      },
      loginUserPayload: { email, password }
    });

    let setUserTimezoneReq: apiToBackend.ToBackendSetUserTimezoneRequest = {
      info: {
        name:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendSetUserTimezone,
        traceId: traceId
      },
      payload: {
        timezone: timezone
      }
    };

    resp = await helper.sendToBackend<apiToBackend.ToBackendSetUserTimezoneResponse>(
      {
        httpServer: prep.httpServer,
        loginToken: prep.loginToken,
        req: setUserTimezoneReq
      }
    );

    await prep.app.close();
  } catch (e) {
    common.logToConsole(e);
  }

  t.is(resp.info.error, undefined);
  t.is(resp.payload.user.timezone, timezone);
});
