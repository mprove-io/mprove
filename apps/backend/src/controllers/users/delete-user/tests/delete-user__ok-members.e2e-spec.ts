import test from 'ava';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { helper } from '~backend/barrels/helper';
import { interfaces } from '~backend/barrels/interfaces';
import { logToConsoleBackend } from '~backend/functions/log-to-console-backend';
import { prepareTestAndSeed } from '~backend/functions/prepare-test';

let testId = 'backend-delete-user__ok-members';

let traceId = testId;

let userId = common.makeId();
let email = `${testId}@example.com`;
let password = '123456';

let secondUserId = common.makeId();
let secondEmail = `2${testId}@example.com`;
let secondPassword = '123';

let orgId = testId;
let orgName = testId;

let projectId = common.makeId();
let projectName = testId;

let prep: interfaces.Prep;

test('1', async t => {
  let resp: apiToBackend.ToBackendDeleteUserResponse;

  try {
    prep = await prepareTestAndSeed({
      traceId: traceId,
      deleteRecordsPayload: {
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
            isEmailVerified: true
          },
          {
            userId: secondUserId,
            email: secondEmail,
            password: secondPassword,
            isEmailVerified: true
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
            name: projectName,
            remoteType: common.ProjectRemoteTypeEnum.Managed,
            defaultBranch: common.BRANCH_MAIN
          }
        ],
        members: [
          {
            memberId: userId,
            email,
            projectId,
            isAdmin: true,
            isEditor: true,
            isExplorer: true
          },
          {
            memberId: secondUserId,
            email: secondEmail,
            projectId,
            isAdmin: true,
            isEditor: true,
            isExplorer: true
          }
        ]
      },
      loginUserPayload: { email, password }
    });

    let deleteUserReq: apiToBackend.ToBackendDeleteUserRequest = {
      info: {
        name: apiToBackend.ToBackendRequestInfoNameEnum.ToBackendDeleteUser,
        traceId: traceId,
        idempotencyKey: common.makeId()
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
