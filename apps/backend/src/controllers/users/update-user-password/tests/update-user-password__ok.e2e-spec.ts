import test from 'ava';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { helper } from '~backend/barrels/helper';
import { interfaces } from '~backend/barrels/interfaces';
import { prepareTest } from '~backend/functions/prepare-test';

let testId = 'update-user-password__ok';

let traceId = testId;
let email = `${testId}@example.com`;
let password = '123';
let newPassword = '456';
let passwordResetToken = '8f7j2938745f';
let prep: interfaces.Prep;

test('1', async t => {
  let resp: apiToBackend.ToBackendUpdateUserPasswordResponse;

  try {
    prep = await prepareTest({
      traceId: traceId,
      deleteRecordsPayload: { emails: [email] },
      seedRecordsPayload: {
        users: [
          {
            email,
            password,
            isEmailVerified: common.BoolEnum.TRUE,
            passwordResetToken
          }
        ]
      },
      loginUserPayload: { email, password }
    });

    let req: apiToBackend.ToBackendUpdateUserPasswordRequest = {
      info: {
        name:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendUpdateUserPassword,
        traceId: traceId
      },
      payload: {
        passwordResetToken,
        newPassword
      }
    };

    resp = await helper.sendToBackend<apiToBackend.ToBackendUpdateUserPasswordResponse>(
      {
        httpServer: prep.httpServer,
        loginToken: prep.loginToken,
        req: req
      }
    );

    await prep.app.close();
  } catch (e) {
    common.logToConsole(e);
  }

  t.is(resp.info.error, undefined);
});
