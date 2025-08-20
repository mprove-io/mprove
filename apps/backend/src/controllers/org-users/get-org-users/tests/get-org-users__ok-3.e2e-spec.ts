import test from 'ava';

import { logToConsoleBackend } from '~backend/functions/log-to-console-backend';
import { prepareTestAndSeed } from '~backend/functions/prepare-test';

let testId = 'backend-get-org-users__ok-3';

let traceId = testId;

let userId = makeId();
let email = `${testId}@example.com`;
let password = '123456';

let secondUserId = makeId();
let secondEmail = `${testId}2@example.com`;
let secondPassword = '123';

let orgId = testId;
let orgName = testId;

let projectId = makeId();
let projectName = testId;

let secondProjectId = makeId();
let secondProjectName = 'p2';

let prep: Prep;

test('1', async t => {
  let resp: ToBackendGetOrgUsersResponse;

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
            remoteType: ProjectRemoteTypeEnum.Managed,
            defaultBranch: BRANCH_MAIN
          },
          {
            orgId,
            projectId: secondProjectId,
            name: secondProjectName,
            remoteType: ProjectRemoteTypeEnum.Managed,
            defaultBranch: BRANCH_MAIN
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

    let req: ToBackendGetOrgUsersRequest = {
      info: {
        name: ToBackendRequestInfoNameEnum.ToBackendGetOrgUsers,
        traceId: traceId,
        idempotencyKey: makeId()
      },
      payload: {
        orgId: orgId,
        perPage: 10,
        pageNum: 1
      }
    };

    resp = await sendToBackend<ToBackendGetOrgUsersResponse>({
      httpServer: prep.httpServer,
      loginToken: prep.loginToken,
      req: req
    });

    await prep.app.close();
  } catch (e) {
    logToConsoleBackend({
      log: e,
      logLevel: LogLevelEnum.Error,
      logger: prep.logger,
      cs: prep.cs
    });
  }

  t.is(resp.info.error, undefined);
  t.is(resp.info.status, ResponseInfoStatusEnum.Ok);
  t.is(resp.payload.total, 2);
  t.is(resp.payload.orgUsersList.length, 2);
});
