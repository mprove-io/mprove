import test from 'ava';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { helper } from '~backend/barrels/helper';
import { interfaces } from '~backend/barrels/interfaces';
import { prepareTest } from '~backend/functions/prepare-test';

let testId = 'backend-get-org__ok';

let traceId = testId;

let email = `${testId}@example.com`;
let password = '123';

let orgId = testId;
let orgName = testId;

let prep: interfaces.Prep;

test('1', async t => {
  let resp: apiToBackend.ToBackendGetOrgResponse;

  try {
    prep = await prepareTest({
      traceId: traceId,
      deleteRecordsPayload: {
        idempotencyKeys: [testId],
        emails: [email],
        orgIds: [orgId]
      },
      seedRecordsPayload: {
        users: [
          {
            email,
            password,
            isEmailVerified: common.BoolEnum.TRUE
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

    let req: apiToBackend.ToBackendGetOrgRequest = {
      info: {
        name: apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetOrg,
        traceId: traceId,
        idempotencyKey: testId
      },
      payload: {
        orgId: orgId
      }
    };

    resp = await helper.sendToBackend<apiToBackend.ToBackendGetOrgResponse>({
      httpServer: prep.httpServer,
      loginToken: prep.loginToken,
      req: req
    });

    await prep.app.close();
  } catch (e) {
    common.logToConsole(e);
  }

  t.is(resp.info.error, undefined);
  t.is(resp.info.status, common.ResponseInfoStatusEnum.Ok);
});
