import test from 'ava';

import { logToConsoleBackend } from '~backend/functions/log-to-console-backend';
import { prepareTestAndSeed } from '~backend/functions/prepare-test';

let testId = 'backend-merge-repo__ok';

let traceId = testId;

let userId = makeId();
let email = `${testId}@example.com`;
let password = '123456';

let orgId = testId;
let orgName = testId;

let projectId = makeId();
let projectName = testId;

let branchId = BRANCH_MAIN;

let theirBranchId = 'b2';

let prep: interfaces.Prep;

test('1', async t => {
  let resp: apiToBackend.ToBackendMergeRepoResponse;

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
        fromBranchId: branchId,
        newBranchId: theirBranchId,
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

    let req: apiToBackend.ToBackendMergeRepoRequest = {
      info: {
        name: apiToBackend.ToBackendRequestInfoNameEnum.ToBackendMergeRepo,
        traceId: traceId,
        idempotencyKey: makeId()
      },
      payload: {
        projectId: projectId,
        branchId: branchId,
        envId: PROJECT_ENV_PROD,
        theirBranchId: theirBranchId
      }
    };

    resp = await sendToBackend<apiToBackend.ToBackendMergeRepoResponse>({
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
});
