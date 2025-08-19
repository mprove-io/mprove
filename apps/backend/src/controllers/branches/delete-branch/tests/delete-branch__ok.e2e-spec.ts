import test from 'ava';

import { logToConsoleBackend } from '~backend/functions/log-to-console-backend';
import { prepareTestAndSeed } from '~backend/functions/prepare-test';

let testId = 'backend-delete-branch__ok';

let traceId = testId;

let userId = makeId();
let email = `${testId}@example.com`;
let password = '123456';

let orgId = testId;
let orgName = testId;

let projectId = makeId();
let projectName = testId;

let newBranchId = makeId();
let fromBranchId = BRANCH_MAIN;

let prep: interfaces.Prep;

test('1', async t => {
  let resp2: apiToBackend.ToBackendDeleteBranchResponse;

  try {
    prep = await prepareTestAndSeed({
      traceId: traceId,
      deleteRecordsPayload: {
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
          }
        ]
      },
      loginUserPayload: { email, password }
    });

    let req1: apiToBackend.ToBackendCreateBranchRequest = {
      info: {
        name: apiToBackend.ToBackendRequestInfoNameEnum.ToBackendCreateBranch,
        traceId: traceId,
        idempotencyKey: makeId()
      },
      payload: {
        projectId: projectId,
        fromBranchId: fromBranchId,
        newBranchId: newBranchId,
        isRepoProd: false
      }
    };

    let resp1 = await sendToBackend<apiToBackend.ToBackendCreateBranchResponse>(
      {
        httpServer: prep.httpServer,
        loginToken: prep.loginToken,
        req: req1
      }
    );

    let req2: apiToBackend.ToBackendDeleteBranchRequest = {
      info: {
        name: apiToBackend.ToBackendRequestInfoNameEnum.ToBackendDeleteBranch,
        traceId: traceId,
        idempotencyKey: makeId()
      },
      payload: {
        projectId: projectId,
        isRepoProd: false,
        branchId: newBranchId
      }
    };

    resp2 = await sendToBackend<apiToBackend.ToBackendDeleteBranchResponse>({
      httpServer: prep.httpServer,
      loginToken: prep.loginToken,
      req: req2
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

  t.is(resp2.info.error, undefined);
  t.is(resp2.info.status, ResponseInfoStatusEnum.Ok);
});
