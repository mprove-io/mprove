import assert from 'node:assert/strict';
import retry from 'async-retry';
import test from 'ava';
import { logToConsoleBackend } from '#backend/functions/top/log-to-console-backend/log-to-console-backend';
import { prepareTestAndSeed } from '#backend/functions/top/prepare-test-and-seed/prepare-test-and-seed';
import { sendToBackend } from '#backend/functions/top/send-to-backend/send-to-backend';
import { Prep } from '#backend/interfaces/prep';
import { BRANCH_MAIN, PROJECT_ENV_PROD } from '#common/constants/top';
import { BACKEND_E2E_RETRY_OPTIONS } from '#common/constants/top-backend';

import { makeId } from '#common/functions/make-id/make-id';
import type { ToBackendCreateBranchRequest } from '#common/types/backend/routes/branches/create-branch/create-branch-request';
import type { ToBackendMergeRepoRequest } from '#common/types/backend/routes/repos/merge-repo/merge-repo-request';
import type { ToBackendMergeRepoResponse } from '#common/types/backend/routes/repos/merge-repo/merge-repo-response';

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

test('1', async t => {
  let isPass: boolean;
  let prep: Prep;

  await retry(async (bail: any) => {
    let resp: ToBackendMergeRepoResponse;

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
              remoteType: 'Managed',
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
          fromBranchId: branchId,
          newBranchId: theirBranchId,
          repoId: userId
        }
      };

      let resp1 = await sendToBackend({
        route: 'api/ToBackendCreateBranch',
        httpServer: prep.httpServer,
        loginToken: prep.loginToken,
        req: req1
      });

      let req: ToBackendMergeRepoRequest = {
        operation: 'mergeRepo',
        traceId: traceId,
        idempotencyKey: makeId(),
        input: {
          projectId: projectId,
          repoId: userId,
          branchId: branchId,
          envId: PROJECT_ENV_PROD,
          theirBranchId: theirBranchId,
          isTheirBranchRemote: false
        }
      };

      resp = await sendToBackend({
        route: 'api/ToBackendMergeRepo',
        httpServer: prep.httpServer,
        loginToken: prep.loginToken,
        req: req
      });

      await prep.app.close();
    } catch (e) {
      logToConsoleBackend({
        log: e,
        logLevel: 'Error',
        logger: prep?.logger,
        cs: prep?.cs
      });
      if (prep) {
        await prep.app.close();
      }
    }

    assert.equal(resp.type, 'Success');

    isPass = true;
  }, BACKEND_E2E_RETRY_OPTIONS).catch((er: any) => {
    logToConsoleBackend({
      log: er,
      logLevel: 'Error',
      logger: prep?.logger,
      cs: prep?.cs
    });
  });

  t.is(isPass, true);
});
