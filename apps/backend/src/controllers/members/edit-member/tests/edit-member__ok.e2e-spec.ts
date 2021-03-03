import test from 'ava';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { helper } from '~backend/barrels/helper';
import { interfaces } from '~backend/barrels/interfaces';
import { prepareTest } from '~backend/functions/prepare-test';

let testId = 'backend-edit-member__ok';

let traceId = testId;
let email = `${testId}@example.com`;
let userId = common.makeId();
let password = '123';
let orgName = testId;
let orgId = testId;
let projectName = testId;
let projectId = common.makeId();

let memberUserEmail = `2${testId}@example.com`;
let memberUserId = common.makeId();

let prep: interfaces.Prep;

test('1', async t => {
  let resp: apiToBackend.ToBackendEditMemberResponse;

  try {
    prep = await prepareTest({
      traceId: traceId,
      deleteRecordsPayload: {
        emails: [email, memberUserEmail],
        orgIds: [orgId],
        projectIds: [projectId]
      },
      seedRecordsPayload: {
        users: [
          {
            userId,
            email,
            password,
            isEmailVerified: common.BoolEnum.TRUE
          },
          {
            userId: memberUserId,
            email: memberUserEmail,
            password,
            isEmailVerified: common.BoolEnum.TRUE
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
            name: projectName
          }
        ],
        members: [
          {
            memberId: userId,
            email,
            projectId,
            isAdmin: common.BoolEnum.TRUE,
            isEditor: common.BoolEnum.TRUE,
            isExplorer: common.BoolEnum.TRUE
          },
          {
            memberId: memberUserId,
            email: memberUserEmail,
            projectId,
            isAdmin: common.BoolEnum.TRUE,
            isEditor: common.BoolEnum.TRUE,
            isExplorer: common.BoolEnum.TRUE
          }
        ]
      },
      loginUserPayload: { email, password }
    });

    let req: apiToBackend.ToBackendEditMemberRequest = {
      info: {
        name: apiToBackend.ToBackendRequestInfoNameEnum.ToBackendEditMember,
        traceId: traceId
      },
      payload: {
        projectId: projectId,
        memberId: memberUserId,
        isAdmin: false,
        isEditor: true,
        isExplorer: true
      }
    };

    resp = await helper.sendToBackend<apiToBackend.ToBackendEditMemberResponse>(
      {
        httpServer: prep.httpServer,
        loginToken: prep.loginToken,
        req: req
      }
    );

    await prep.app.close();
  } catch (e) {
    common.logToConsole(e);
  }

  t.is(resp.info.error, undefined);
  t.is(resp.info.status, common.ResponseInfoStatusEnum.Ok);
});
