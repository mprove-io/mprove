import test from 'ava';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { helper } from '~backend/barrels/helper';
import { interfaces } from '~backend/barrels/interfaces';
import { logToConsoleBackend } from '~backend/functions/log-to-console-backend';
import { prepareTestAndSeed } from '~backend/functions/prepare-test';

let testId = 'backend-get-org-users__ok-3';

let traceId = testId;

let userId = common.makeId();
let email = `${testId}@example.com`;
let password = '123456';

let secondUserId = common.makeId();
let secondEmail = `${testId}2@example.com`;
let secondPassword = '123';

let orgId = testId;
let orgName = testId;

let projectId = common.makeId();
let projectName = testId;

let secondProjectId = common.makeId();
let secondProjectName = 'p2';

let prep: interfaces.Prep;

test('1', async t => {
  let resp: apiToBackend.ToBackendGetOrgUsersResponse;

  try {
    prep = await prepareTestAndSeed({
      traceId: traceId,
      deleteRecordsPayload: {
        emails: [email, secondEmail],
        orgIds: [orgId],
        projectIds: [projectId, secondProjectId],
        projectNames: [projectName, secondProjectName]
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
            ownerEmail: email
          }
        ],
        projects: [
          {
            orgId,
            projectId,
            name: projectName,
            remoteType: common.ProjectRemoteTypeEnum.Managed,
            defaultBranch: common.BRANCH_MAIN
          },
          {
            orgId,
            projectId: secondProjectId,
            name: secondProjectName,
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
            projectId: secondProjectId,
            isAdmin: true,
            isEditor: true,
            isExplorer: true
          }
        ]
      },
      loginUserPayload: { email, password }
    });

    let req: apiToBackend.ToBackendGetOrgUsersRequest = {
      info: {
        name: apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetOrgUsers,
        traceId: traceId,
        idempotencyKey: common.makeId()
      },
      payload: {
        orgId: orgId,
        perPage: 10,
        pageNum: 1
      }
    };

    resp =
      await helper.sendToBackend<apiToBackend.ToBackendGetOrgUsersResponse>({
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
  t.is(resp.payload.total, 2);
  t.is(resp.payload.orgUsersList.length, 2);
});
