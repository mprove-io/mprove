import test from 'ava';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { helper } from '~backend/barrels/helper';
import { interfaces } from '~backend/barrels/interfaces';
import { prepareTest } from '~backend/functions/prepare-test';

let testId = 'backend-delete-user__ok-members';

let traceId = testId;

let userId = common.makeId();
let email = `${testId}@example.com`;
let password = '123';

let secondUserId = common.makeId();
let secondEmail = `2${testId}@example.com`;
let secondPassword = '123';

let orgId = testId;
let orgName = testId;

let projectId = common.makeId();
let projectName = 'p1';

let prep: interfaces.Prep;

test('1', async t => {
  let resp: apiToBackend.ToBackendDeleteUserResponse;

  try {
    prep = await prepareTest({
      traceId: traceId,
      deleteRecordsPayload: {
        idempotencyKeys: [testId],
        emails: [email, secondEmail],
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
          },
          {
            userId: secondUserId,
            email: secondEmail,
            password: secondPassword,
            isEmailVerified: common.BoolEnum.TRUE
          }
        ],
        orgs: [
          {
            orgId,
            name: orgName,
            ownerEmail: secondEmail
          }
        ],
        projects: [
          {
            orgId,
            projectId,
            name: projectName
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
          },
          {
            memberId: secondUserId,
            email: secondEmail,
            projectId,
            isAdmin: common.BoolEnum.TRUE,
            isEditor: common.BoolEnum.TRUE,
            isExplorer: common.BoolEnum.TRUE
          }
        ]
      },
      loginUserPayload: { email, password }
    });

    let deleteUserReq: apiToBackend.ToBackendDeleteUserRequest = {
      info: {
        name: apiToBackend.ToBackendRequestInfoNameEnum.ToBackendDeleteUser,
        traceId: traceId,
        idempotencyKey: testId
      },
      payload: {}
    };

    resp = await helper.sendToBackend<apiToBackend.ToBackendDeleteUserResponse>(
      {
        httpServer: prep.httpServer,
        loginToken: prep.loginToken,
        req: deleteUserReq
      }
    );

    await prep.app.close();
  } catch (e) {
    common.logToConsole(e);
  }

  t.is(resp.info.error, undefined);
  t.is(resp.info.status, common.ResponseInfoStatusEnum.Ok);
});
