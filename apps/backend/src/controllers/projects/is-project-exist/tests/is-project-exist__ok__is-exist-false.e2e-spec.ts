import test from 'ava';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { helper } from '~backend/barrels/helper';
import { interfaces } from '~backend/barrels/interfaces';
import { logToConsoleBackend } from '~backend/functions/log-to-console-backend';
import { prepareTestAndSeed } from '~backend/functions/prepare-test';

let testId = 'backend-is-project-exist__ok__is-exist-false';

let traceId = testId;

let email = `${testId}@example.com`;
let password = '123456';

let orgId = testId;
let orgName = testId;

let projectName = testId; // testId

let prep: interfaces.Prep;

test('1', async t => {
  let resp: apiToBackend.ToBackendIsProjectExistResponse;

  try {
    prep = await prepareTestAndSeed({
      traceId: traceId,
      deleteRecordsPayload: {
        emails: [email],
        orgIds: [orgId]
      },
      seedRecordsPayload: {
        users: [
          {
            email,
            password,
            isEmailVerified: true
          }
        ],
        orgs: [
          {
            orgId: orgId,
            ownerEmail: email,
            name: orgName
          }
        ]
      },
      loginUserPayload: { email, password }
    });

    let req: apiToBackend.ToBackendIsProjectExistRequest = {
      info: {
        name: apiToBackend.ToBackendRequestInfoNameEnum.ToBackendIsProjectExist,
        traceId: traceId,
        idempotencyKey: common.makeId()
      },
      payload: {
        orgId: orgId,
        name: projectName
      }
    };

    resp =
      await helper.sendToBackend<apiToBackend.ToBackendIsProjectExistResponse>({
        httpServer: prep.httpServer,
        loginToken: prep.loginToken,
        req: req
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

  t.is(resp.info.error, undefined);
  t.is(resp.info.status, common.ResponseInfoStatusEnum.Ok);
  t.is(resp.payload.isExist, false);
});
