import test from 'ava';
import { BRANCH_MAIN } from '#common/constants/top';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { ProjectRemoteTypeEnum } from '#common/enums/project-remote-type.enum';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { makeId } from '#common/functions/make-id';
import {
  ToBackendDeleteUserRequest,
  ToBackendDeleteUserResponse
} from '#common/interfaces/to-backend/users/to-backend-delete-user';
import { logToConsoleBackend } from '~backend/functions/log-to-console-backend';
import { prepareTestAndSeed } from '~backend/functions/prepare-test';
import { sendToBackend } from '~backend/functions/send-to-backend';
import { Prep } from '~backend/interfaces/prep';

let testId = 'backend-delete-user__ok-members';

let traceId = testId;

let userId = makeId();
let email = `${testId}@example.com`;
let password = '123456';

let secondUserId = makeId();
let secondEmail = `2${testId}@example.com`;
let secondPassword = '123';

let orgId = testId;
let orgName = testId;

let projectId = makeId();
let projectName = testId;

let prep: Prep;

test('1', async t => {
  let resp: ToBackendDeleteUserResponse;

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
            projectId,
            isAdmin: true,
            isEditor: true,
            isExplorer: true
          }
        ]
      },
      loginUserPayload: { email, password }
    });

    let deleteUserReq: ToBackendDeleteUserRequest = {
      info: {
        name: ToBackendRequestInfoNameEnum.ToBackendDeleteUser,
        traceId: traceId,
        idempotencyKey: makeId()
      },
      payload: {}
    };

    resp = await sendToBackend<ToBackendDeleteUserResponse>({
      httpServer: prep.httpServer,
      loginToken: prep.loginToken,
      req: deleteUserReq
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
