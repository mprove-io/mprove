import test from 'ava';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { helper } from '~backend/barrels/helper';
import { interfaces } from '~backend/barrels/interfaces';
import { logToConsoleBackend } from '~backend/functions/log-to-console-backend';
import { prepareTest } from '~backend/functions/prepare-test';

let testId = 'backend-get-org__org-not-found';

let traceId = testId;

let email = `${testId}@example.com`;
let password = '123456';

let notFoundOrgId = `unk`;

let prep: interfaces.Prep;

test('1', async t => {
  let resp: apiToBackend.ToBackendGetOrgResponse;

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

    let req: apiToBackend.ToBackendGetOrgRequest = {
      info: {
        name: apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetOrg,
        traceId: traceId,
        idempotencyKey: testId
      },
      payload: {
        orgId: notFoundOrgId
      }
    };

    resp = await helper.sendToBackend<apiToBackend.ToBackendGetOrgResponse>({
      httpServer: prep.httpServer,
      loginToken: prep.loginToken,
      req: req
    });

    await prep.app.close();
  } catch (e) {
    logToConsoleBackend({
      log: e,
      logLevel: common.LogLevelEnum.Error,
      logger: prep.logger
    });
  }

  t.is(resp.info.error.message, common.ErEnum.BACKEND_ORG_DOES_NOT_EXIST);
});
