import test from 'ava';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { helper } from '~backend/barrels/helper';
import { interfaces } from '~backend/barrels/interfaces';
import { prepareTest } from '~backend/functions/prepare-test';

let testId = 'set-org-owner__ok';

let traceId = testId;

let email = `${testId}@example.com`;
let password = '123';

let orgName = testId;
let orgId = common.makeId();

let newOwnerEmail = `new-${testId}@example.com`;
let newOwnerPassword = '123';

let prep: interfaces.Prep;

test('1', async t => {
  let resp: apiToBackend.ToBackendSetOrgOwnerResponse;

  try {
    prep = await prepareTest({
      traceId: traceId,
      deleteRecordsPayload: {
        emails: [email, newOwnerEmail],
        orgNames: [orgName]
      },
      seedRecordsPayload: {
        users: [
          {
            email,
            password,
            isEmailVerified: common.BoolEnum.TRUE
          },
          {
            email: newOwnerEmail,
            password: newOwnerPassword,
            isEmailVerified: common.BoolEnum.TRUE,
            status: common.UserStatusEnum.Active
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
        traceId: traceId
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

  t.is(resp.info.error, undefined);
  t.is(resp.info.status, common.ResponseInfoStatusEnum.Ok);
});