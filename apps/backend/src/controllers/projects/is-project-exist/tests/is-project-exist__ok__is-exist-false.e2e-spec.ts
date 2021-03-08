import test from 'ava';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { helper } from '~backend/barrels/helper';
import { interfaces } from '~backend/barrels/interfaces';
import { prepareTest } from '~backend/functions/prepare-test';

let testId = 'backend-is-project-exist__ok__is-exist-false';

let traceId = testId;

let email = `${testId}@example.com`;
let password = '123';

let orgId = testId;
let orgName = testId;

let projectName = 'p1';

let prep: interfaces.Prep;

test('1', async t => {
  let resp: apiToBackend.ToBackendIsProjectExistResponse;

  try {
    prep = await prepareTest({
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

    let req: apiToBackend.ToBackendIsProjectExistRequest = {
      info: {
        name: apiToBackend.ToBackendRequestInfoNameEnum.ToBackendIsProjectExist,
        traceId: traceId
      },
      payload: {
        orgId: orgId,
        name: projectName
      }
    };

    resp = await helper.sendToBackend<apiToBackend.ToBackendIsProjectExistResponse>(
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
  t.is(resp.payload.isExist, false);
});
