import test from 'ava';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { helper } from '~backend/barrels/helper';
import { interfaces } from '~backend/barrels/interfaces';
import { logToConsoleBackend } from '~backend/functions/log-to-console-backend';
import { prepareTestAndSeed } from '~backend/functions/prepare-test';

let testId = 'backend-set-org-owner__ok';

let traceId = testId;

let email = `${testId}@example.com`;
let password = '123456';

let orgId = testId;
let orgName = testId;

let newOwnerEmail = `new-${testId}@example.com`;
let newOwnerPassword = '123';

let prep: interfaces.Prep;

test('1', async t => {
  let resp: apiToBackend.ToBackendSetOrgOwnerResponse;

  try {
    prep = await prepareTestAndSeed({
      traceId: traceId,
      deleteRecordsPayload: {
        emails: [email, newOwnerEmail],
        orgIds: [orgId]
      },
      seedRecordsPayload: {
        users: [
          {
            email,
            password,
            isEmailVerified: true
          },
          {
            email: newOwnerEmail,
            password: newOwnerPassword,
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

    let req: apiToBackend.ToBackendSetOrgOwnerRequest = {
      info: {
        name: apiToBackend.ToBackendRequestInfoNameEnum.ToBackendSetOrgOwner,
        traceId: traceId,
        idempotencyKey: common.makeId()
      },
      payload: {
        orgId: orgId,
        ownerEmail: newOwnerEmail
      }
    };

    resp =
      await helper.sendToBackend<apiToBackend.ToBackendSetOrgOwnerResponse>({
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
});
