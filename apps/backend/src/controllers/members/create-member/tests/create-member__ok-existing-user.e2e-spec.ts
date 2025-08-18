import test from 'ava';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { helper } from '~backend/barrels/helper';
import { interfaces } from '~backend/barrels/interfaces';
import { logToConsoleBackend } from '~backend/functions/log-to-console-backend';
import { prepareTestAndSeed } from '~backend/functions/prepare-test';

let testId = 'backend-create-member__ok-existing-user';

let traceId = testId;

let userId = common.makeId();
let email = `${testId}@example.com`;
let password = '123456';

let invitedUserId = common.makeId();
let invitedEmail = `2${testId}@example.com`;

let orgId = testId;
let orgName = testId;

let projectId = common.makeId();
let projectName = testId;

let prep: interfaces.Prep;

test('1', async t => {
  let resp: apiToBackend.ToBackendCreateMemberResponse;

  try {
    prep = await prepareTestAndSeed({
      traceId: traceId,
      deleteRecordsPayload: {
        emails: [email, invitedEmail],
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
            userId: invitedUserId,
            email: invitedEmail,
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
          }
        ]
      },
      loginUserPayload: { email, password }
    });

    let req: apiToBackend.ToBackendCreateMemberRequest = {
      info: {
        name: apiToBackend.ToBackendRequestInfoNameEnum.ToBackendCreateMember,
        traceId: traceId,
        idempotencyKey: common.makeId()
      },
      payload: {
        projectId: projectId,
        email: invitedEmail
      }
    };

    resp =
      await helper.sendToBackend<apiToBackend.ToBackendCreateMemberResponse>({
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
});
