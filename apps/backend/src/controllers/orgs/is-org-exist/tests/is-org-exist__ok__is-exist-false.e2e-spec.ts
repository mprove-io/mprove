import test from 'ava';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { helper } from '~backend/barrels/helper';
import { interfaces } from '~backend/barrels/interfaces';
import { logToConsoleBackend } from '~backend/functions/log-to-console-backend';
import { prepareTest } from '~backend/functions/prepare-test';

let testId = 'backend-is-org-exist__ok__is-exist-false';

let traceId = testId;

let email = `${testId}@example.com`;
let password = '123456';

let orgName = testId;

let prep: interfaces.Prep;

test('1', async t => {
  let resp: apiToBackend.ToBackendIsOrgExistResponse;

  try {
    prep = await prepareTest({
      traceId: traceId,
      deleteRecordsPayload: {
        idempotencyKeys: [testId],
        emails: [email]
      },
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

    let req: apiToBackend.ToBackendIsOrgExistRequest = {
      info: {
        name: apiToBackend.ToBackendRequestInfoNameEnum.ToBackendIsOrgExist,
        traceId: traceId,
        idempotencyKey: testId
      },
      payload: {
        name: orgName
      }
    };

    resp = await helper.sendToBackend<apiToBackend.ToBackendIsOrgExistResponse>(
      {
        httpServer: prep.httpServer,
        loginToken: prep.loginToken,
        req: req
      }
    );

    await prep.app.close();
  } catch (e) {
    logToConsoleBackend({
      log: e,
      logLevel: common.LogLevelEnum.Error,
      pinoLogger: prep.pinoLogger
    });
  }

  t.is(resp.info.error, undefined);
  t.is(resp.info.status, common.ResponseInfoStatusEnum.Ok);
  t.is(resp.payload.isExist, false);
});
