import test from 'ava';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { helper } from '~backend/barrels/helper';
import { interfaces } from '~backend/barrels/interfaces';
import { prepareTest } from '~backend/functions/prepare-test';

let testId = 'set-user-name__ok';

let traceId = testId;
let email = `${testId}@example.com`;
let password = '123';
let firstName = 'John';
let lastName = 'Smith';
let prep: interfaces.Prep;

test('1', async t => {
  let resp: apiToBackend.ToBackendSetUserNameResponse;

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

    let setUserNameReq: apiToBackend.ToBackendSetUserNameRequest = {
      info: {
        name: apiToBackend.ToBackendRequestInfoNameEnum.ToBackendSetUserName,
        traceId: traceId
      },
      payload: {
        firstName: firstName,
        lastName: lastName
      }
    };

    resp = await helper.sendToBackend<apiToBackend.ToBackendSetUserNameResponse>(
      {
        httpServer: prep.httpServer,
        loginToken: prep.loginToken,
        req: setUserNameReq
      }
    );

    await prep.app.close();
  } catch (e) {
    common.logToConsole(e);
  }

  t.is(resp.info.error, undefined);
  t.is(resp.payload.user.firstName, firstName);
  t.is(resp.payload.user.lastName, lastName);
});
