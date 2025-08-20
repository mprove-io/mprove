import test from 'ava';
import { logToConsoleBackend } from '~backend/functions/log-to-console-backend';
import { prepareTestAndSeed } from '~backend/functions/prepare-test';
import { sendToBackend } from '~backend/functions/send-to-backend';
import { Prep } from '~backend/interfaces/prep';
import { BRANCH_MAIN } from '~common/constants/top';
import { ErEnum } from '~common/enums/er.enum';
import { LogLevelEnum } from '~common/enums/log-level.enum';
import { ProjectRemoteTypeEnum } from '~common/enums/project-remote-type.enum';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import { makeId } from '~common/functions/make-id';
import {
  ToBackendGetMembersRequest,
  ToBackendGetMembersResponse
} from '~common/interfaces/to-backend/members/to-backend-get-members';

let testId = 'backend-get-members__member-does-not-exist';

let traceId = testId;

let userId = makeId();
let email = `${testId}@example.com`;
let password = '123456';

let userId2 = makeId();
let email2 = `2${testId}@example.com`;

let orgId = testId;
let orgName = testId;

let projectId = makeId();
let projectName = testId;

let prep: Prep;

test('1', async t => {
  let resp: ToBackendGetMembersResponse;

  try {
    prep = await prepareTestAndSeed({
      traceId: traceId,
      deleteRecordsPayload: {
        emails: [email, email2],
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
            userId: userId2,
            email: email2,
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
            memberId: userId2,
            email: email2,
            projectId,
            isAdmin: false,
            isEditor: true,
            isExplorer: true
          }
        ]
      },
      loginUserPayload: { email, password }
    });

    let req: ToBackendGetMembersRequest = {
      info: {
        name: ToBackendRequestInfoNameEnum.ToBackendGetMembers,
        traceId: traceId,
        idempotencyKey: makeId()
      },
      payload: {
        projectId: projectId,
        perPage: 10,
        pageNum: 1
      }
    };

    resp = await sendToBackend<ToBackendGetMembersResponse>({
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

  t.is(resp.info.error.message, ErEnum.BACKEND_MEMBER_DOES_NOT_EXIST);
});
