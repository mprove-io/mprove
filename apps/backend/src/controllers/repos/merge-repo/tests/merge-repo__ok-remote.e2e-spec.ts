import assert from 'node:assert/strict';
import retry from 'async-retry';
import test from 'ava';
import { logToConsoleBackend } from '#backend/functions/log-to-console-backend';
import { prepareTestAndSeed } from '#backend/functions/prepare-test';
import { sendToBackend } from '#backend/functions/send-to-backend';
import { Prep } from '#backend/interfaces/prep';
import { BRANCH_MAIN, PROJECT_ENV_PROD } from '#common/constants/top';
import { BACKEND_E2E_RETRY_OPTIONS } from '#common/constants/top-backend';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { ProjectRemoteTypeEnum } from '#common/enums/project-remote-type.enum';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { makeId } from '#common/functions/make-id';
import type {
  ToBackendCreateBranchRequest,
  ToBackendCreateBranchResponse
} from '#common/zod/to-backend/branches/to-backend-create-branch';
import type {
  ToBackendSaveFileRequest,
  ToBackendSaveFileResponse
} from '#common/zod/to-backend/files/to-backend-save-file';
import type {
  ToBackendCommitRepoRequest,
  ToBackendCommitRepoResponse
} from '#common/zod/to-backend/repos/to-backend-commit-repo';
import type {
  ToBackendMergeRepoRequest,
  ToBackendMergeRepoResponse
} from '#common/zod/to-backend/repos/to-backend-merge-repo';
import type {
  ToBackendPushRepoRequest,
  ToBackendPushRepoResponse
} from '#common/zod/to-backend/repos/to-backend-push-repo';

let testId = 'backend-merge-repo__ok-remote';

let traceId = testId;

let userId = makeId();
let email = `${testId}@example.com`;
let password = '123456';

let orgId = testId;
let orgName = testId;

let projectId = makeId();
let projectName = testId;

let branchId = 'b2';

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
        info: {
          name: ToBackendRequestInfoNameEnum.ToBackendCreateBranch,
          traceId: traceId,
          idempotencyKey: makeId()
        },
        payload: {
          projectId: projectId,
          fromBranchId: BRANCH_MAIN,
          newBranchId: branchId,
          repoId: userId
        }
      };

      let resp1 = await sendToBackend<ToBackendCreateBranchResponse>({
        httpServer: prep.httpServer,
        loginToken: prep.loginToken,
        req: req1
      });

      let saveFileReq: ToBackendSaveFileRequest = {
        info: {
          name: ToBackendRequestInfoNameEnum.ToBackendSaveFile,
          traceId: traceId,
          idempotencyKey: makeId()
        },
        payload: {
          projectId: projectId,
          repoId: userId,
          branchId: BRANCH_MAIN,
          envId: PROJECT_ENV_PROD,
          fileNodeId: `${projectId}/readme.md`,
          content: 'remote change'
        }
      };

      let saveFileResp = await sendToBackend<ToBackendSaveFileResponse>({
        httpServer: prep.httpServer,
        loginToken: prep.loginToken,
        req: saveFileReq
      });

      let commitReq: ToBackendCommitRepoRequest = {
        info: {
          name: ToBackendRequestInfoNameEnum.ToBackendCommitRepo,
          traceId: traceId,
          idempotencyKey: makeId()
        },
        payload: {
          projectId: projectId,
          branchId: BRANCH_MAIN,
          repoId: userId,
          commitMessage: 'commit on main'
        }
      };

      let commitResp = await sendToBackend<ToBackendCommitRepoResponse>({
        httpServer: prep.httpServer,
        loginToken: prep.loginToken,
        req: commitReq
      });

      let pushReq: ToBackendPushRepoRequest = {
        info: {
          name: ToBackendRequestInfoNameEnum.ToBackendPushRepo,
          traceId: traceId,
          idempotencyKey: makeId()
        },
        payload: {
          projectId: projectId,
          repoId: userId,
          branchId: BRANCH_MAIN,
          envId: PROJECT_ENV_PROD
        }
      };

      let pushResp = await sendToBackend<ToBackendPushRepoResponse>({
        httpServer: prep.httpServer,
        loginToken: prep.loginToken,
        req: pushReq
      });

      let req: ToBackendMergeRepoRequest = {
        info: {
          name: ToBackendRequestInfoNameEnum.ToBackendMergeRepo,
          traceId: traceId,
          idempotencyKey: makeId()
        },
        payload: {
          projectId: projectId,
          repoId: userId,
          branchId: branchId,
          envId: PROJECT_ENV_PROD,
          theirBranchId: BRANCH_MAIN,
          isTheirBranchRemote: true
        }
      };

      resp = await sendToBackend<ToBackendMergeRepoResponse>({
        httpServer: prep.httpServer,
        loginToken: prep.loginToken,
        req: req
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

    assert.equal(resp.info.error, undefined);
    assert.equal(resp.info.status, ResponseInfoStatusEnum.Ok);

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
