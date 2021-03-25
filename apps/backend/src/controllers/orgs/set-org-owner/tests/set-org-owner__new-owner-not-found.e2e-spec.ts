import test from 'ava';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { helper } from '~backend/barrels/helper';
import { interfaces } from '~backend/barrels/interfaces';
import { prepareTest } from '~backend/functions/prepare-test';

let testId = 'backend-set-org-owner__new-owner-not-found';

let traceId = testId;

let email = `${testId}@example.com`;
let password = '123';

let newOwnerEmail = `new-${testId}@example.com`;

let orgId = testId;
let orgName = testId;

let prep: interfaces.Prep;

test('1', async t => {
  let resp: apiToBackend.ToBackendSetOrgOwnerResponse;

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

    let req: apiToBackend.ToBackendSetOrgOwnerRequest = {
      info: {
        name: apiToBackend.ToBackendRequestInfoNameEnum.ToBackendSetOrgOwner,
        traceId: traceId,
        idempotencyKey: testId
      },
      payload: {
        orgId: orgId,
        ownerEmail: newOwnerEmail
      }
    };

    resp = await helper.sendToBackend<apiToBackend.ToBackendSetOrgOwnerResponse>(
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

  t.is(
    resp.info.error.message,
    apiToBackend.ErEnum.BACKEND_NEW_OWNER_NOT_FOUND
  );
});
