import test from 'ava';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { helper } from '~backend/barrels/helper';
import { interfaces } from '~backend/barrels/interfaces';
import { prepareTest } from '~backend/functions/prepare-test';

let testId = 'backend-get-members__member-does-not-exist';

let traceId = testId;
let email = `${testId}@example.com`;
let email2 = `2${testId}@example.com`;
let password = '123';
let orgName = testId;
let userId = common.makeId();
let userId2 = common.makeId();
let orgId = testId;
let projectName = testId;
let projectId = common.makeId();
let prep: interfaces.Prep;

test('1', async t => {
  let resp: apiToBackend.ToBackendGetMembersResponse;

  try {
    prep = await prepareTest({
      traceId: traceId,
      deleteRecordsPayload: {
        emails: [email, email2],
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
            userId: userId2,
            email: email2,
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
            memberId: userId2,
            email: email2,
            projectId,
            isAdmin: common.BoolEnum.FALSE,
            isEditor: common.BoolEnum.TRUE,
            isExplorer: common.BoolEnum.TRUE
          }
        ]
      },
      loginUserPayload: { email, password }
    });

    let req: apiToBackend.ToBackendGetMembersRequest = {
      info: {
        name: apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetMembers,
        traceId: traceId
      },
      payload: {
        projectId: projectId
      }
    };

    resp = await helper.sendToBackend<apiToBackend.ToBackendGetMembersResponse>(
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

  t.is(
    resp.info.error.message,
    apiToBackend.ErEnum.BACKEND_MEMBER_DOES_NOT_EXIST
  );
});
