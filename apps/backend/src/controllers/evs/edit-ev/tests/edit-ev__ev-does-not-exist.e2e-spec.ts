import test from 'ava';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { helper } from '~backend/barrels/helper';
import { interfaces } from '~backend/barrels/interfaces';
import { prepareTest } from '~backend/functions/prepare-test';

let testId = 'backend-edit-ev__ev-does-not-exist';

let traceId = testId;

let userId = common.makeId();
let email = `${testId}@example.com`;
let password = '123456';

let orgId = testId;
let orgName = testId;

let projectId = common.makeId();
let projectName = testId;

let evId = 'MPROVE_EV1';
let val: '123';

let prep: interfaces.Prep;

test('1', async t => {
  let resp: apiToBackend.ToBackendEditEvResponse;

  try {
    prep = await prepareTest({
      traceId: traceId,
      deleteRecordsPayload: {
        idempotencyKeys: [testId],
        emails: [email],
        orgIds: [orgId],
        projectIds: [projectId],
        projectNames: [projectName]
      },
      seedRecordsPayload: {
        users: [
          {
            userId,
            email,
            password,
            isEmailVerified: common.BoolEnum.TRUE
          }
        ],
        orgs: [
          {
            orgId,
            name: orgName,
            ownerEmail: email
          }
        ],
        projects: [
          {
            orgId,
            projectId,
            name: projectName,
            remoteType: common.ProjectRemoteTypeEnum.Managed,
            defaultBranch: common.BRANCH_MASTER
          }
        ],
        members: [
          {
            memberId: userId,
            email,
            projectId,
            isAdmin: common.BoolEnum.TRUE,
            isEditor: common.BoolEnum.TRUE,
            isExplorer: common.BoolEnum.TRUE
          }
        ]
      },
      loginUserPayload: { email, password }
    });

    let req: apiToBackend.ToBackendEditEvRequest = {
      info: {
        name: apiToBackend.ToBackendRequestInfoNameEnum.ToBackendEditEv,
        traceId: traceId,
        idempotencyKey: testId
      },
      payload: {
        projectId: projectId,
        envId: common.PROJECT_ENV_PROD,
        evId: evId,
        val: val
      }
    };

    resp = await helper.sendToBackend<apiToBackend.ToBackendEditEvResponse>({
      httpServer: prep.httpServer,
      loginToken: prep.loginToken,
      req: req
    });

    await prep.app.close();
  } catch (e) {
    common.logToConsole(e);
  }

  t.is(resp.info.error.message, common.ErEnum.BACKEND_EV_DOES_NOT_EXIST);
});
