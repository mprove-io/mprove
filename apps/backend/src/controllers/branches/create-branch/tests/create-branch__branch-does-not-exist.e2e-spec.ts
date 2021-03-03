import test from 'ava';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { helper } from '~backend/barrels/helper';
import { interfaces } from '~backend/barrels/interfaces';
import { prepareTest } from '~backend/functions/prepare-test';

let testId = 'backend-create-branch__branch-does-not-exist';

let traceId = testId;
let email = `${testId}@example.com`;
let password = '123';
let orgName = testId;
let userId = common.makeId();
let repoId = userId;
let fromBranchId = 'unk';
let newBranchId = common.makeId();
let orgId = testId;
let projectName = testId;
let projectId = common.makeId();
let prep: interfaces.Prep;

test('1', async t => {
  let resp: apiToBackend.ToBackendCreateBranchResponse;

  try {
    prep = await prepareTest({
      traceId: traceId,
      deleteRecordsPayload: {
        emails: [email],
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
          }
        ]
      },
      loginUserPayload: { email, password }
    });

    let req: apiToBackend.ToBackendCreateBranchRequest = {
      info: {
        name: apiToBackend.ToBackendRequestInfoNameEnum.ToBackendCreateBranch,
        traceId: traceId
      },
      payload: {
        projectId: projectId,
        repoId: repoId,
        fromBranchId: fromBranchId,
        newBranchId: newBranchId,
        isFromRemote: false
      }
    };

    resp = await helper.sendToBackend<apiToBackend.ToBackendCreateBranchResponse>(
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
    apiToBackend.ErEnum.BACKEND_BRANCH_DOES_NOT_EXIST
  );
});
