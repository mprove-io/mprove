import assert from 'node:assert/strict';
import retry from 'async-retry';
import test from 'ava';
import { logToConsoleBackend } from '#backend/functions/log-to-console-backend';
import { prepareTestAndSeed } from '#backend/functions/prepare-test';
import { sendToBackend } from '#backend/functions/send-to-backend';
import { Prep } from '#backend/interfaces/prep';
import { BRANCH_MAIN } from '#common/constants/top';
import { BACKEND_E2E_RETRY_OPTIONS } from '#common/constants/top-backend';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { ProjectRemoteTypeEnum } from '#common/enums/project-remote-type.enum';
import { makeId } from '#common/functions/make-id/make-id';
import type { ToBackendCreateBranchRequest } from '#common/types/backend/routes/branches/create-branch/create-branch-request';
import type { ToBackendDeleteBranchRequest } from '#common/types/backend/routes/branches/delete-branch/delete-branch-request';
import type { ToBackendDeleteBranchResponse } from '#common/types/backend/routes/branches/delete-branch/delete-branch-response';

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

test('1', async t => {
  let isPass: boolean;
  let prep: Prep;

  await retry(async (bail: any) => {
    let resp2: ToBackendDeleteBranchResponse;

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

      let req1: ToBackendCreateBranchRequest = {
        operation: 'createBranch',
        traceId: traceId,
        idempotencyKey: makeId(),
        input: {
          projectId: projectId,
          fromBranchId: fromBranchId,
          newBranchId: newBranchId,
          repoId: userId
        }
      };

      let resp1 = await sendToBackend({
        route: 'api/ToBackendCreateBranch',
        httpServer: prep.httpServer,
        loginToken: prep.loginToken,
        req: req1
      });

      let req2: ToBackendDeleteBranchRequest = {
        operation: 'deleteBranch',
        traceId: traceId,
        idempotencyKey: makeId(),
        input: {
          projectId: projectId,
          repoId: userId,
          branchId: newBranchId
        }
      };

      resp2 = await sendToBackend({
        route: 'api/ToBackendDeleteBranch',
        httpServer: prep.httpServer,
        loginToken: prep.loginToken,
        req: req2
      });

      await prep.app.close();
    } catch (e) {
      logToConsoleBackend({
        log: e,
        logLevel: LogLevelEnum.Error,
        logger: prep?.logger,
        cs: prep?.cs
      });
      if (prep) {
        await prep.app.close();
      }
    }

    assert.equal(resp2.type, 'Success');

    isPass = true;
  }, BACKEND_E2E_RETRY_OPTIONS).catch((er: any) => {
    logToConsoleBackend({
      log: er,
      logLevel: LogLevelEnum.Error,
      logger: prep?.logger,
      cs: prep?.cs
    });
  });

  t.is(isPass, true);
});
