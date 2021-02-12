import test from 'ava';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { helper } from '~backend/barrels/helper';
import { interfaces } from '~backend/barrels/interfaces';
import { prepareTest } from '~backend/functions/prepare-test';

let testId = 'create-org__org-already-exists';

let traceId = testId;
let email = `${testId}@example.com`;
let userId = `testId`;
let password = '123';
let orgName = testId;
let prep: interfaces.Prep;

test('1', async t => {
  let resp: apiToBackend.ToBackendCreateOrgResponse;

  try {
    prep = await prepareTest({
      traceId: traceId,
      deleteRecordsPayload: {
        emails: [email],
        orgNames: [orgName]
      },
      seedRecordsPayload: {
        users: [
          {
            email,
            password,
            isEmailVerified: common.BoolEnum.TRUE,
            userId
          }
        ],
        orgs: [
          {
            name: orgName,
            ownerEmail: email,
            ownerId: userId
          }
        ]
      },
      loginUserPayload: { email, password }
    });

    let req: apiToBackend.ToBackendCreateOrgRequest = {
      info: {
        name: apiToBackend.ToBackendRequestInfoNameEnum.ToBackendCreateOrg,
        traceId: traceId
      },
      payload: {
        name: orgName
      }
    };

    resp = await helper.sendToBackend<apiToBackend.ToBackendCreateOrgResponse>({
      httpServer: prep.httpServer,
      loginToken: prep.loginToken,
      req: req
    });

    await prep.app.close();
  } catch (e) {
    common.logToConsole(e);
  }

  t.is(resp.info.error.message, apiToBackend.ErEnum.BACKEND_ORG_ALREADY_EXIST);
});
