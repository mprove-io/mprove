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
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { makeId } from '#common/functions/make-id';
import type {
  ToBackendGetOrgUsersRequest,
  ToBackendGetOrgUsersResponse
} from '#common/zod/to-backend/org-users/to-backend-get-org-users';

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

test('1', async t => {
  let isPass: boolean;
  let prep: Prep;

  await retry(async (bail: any) => {
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
        logger: prep?.logger,
        cs: prep?.cs
      });
      if (prep) {
        await prep.app.close();
      }
    }

    assert.equal(resp.info.error, undefined);
    assert.equal(resp.info.status, ResponseInfoStatusEnum.Ok);
    assert.equal(resp.payload.total, 2);
    assert.equal(resp.payload.orgUsersList.length, 2);

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
