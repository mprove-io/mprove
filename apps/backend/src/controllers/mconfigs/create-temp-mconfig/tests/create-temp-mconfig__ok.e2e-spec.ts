import test from 'ava';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { helper } from '~backend/barrels/helper';
import { interfaces } from '~backend/barrels/interfaces';
import { prepareTest } from '~backend/functions/prepare-test';

let testId = 'backend-create-temp-mconfig__ok';

let traceId = testId;

let userId = common.makeId();
let email = `${testId}@example.com`;
let password = '123';

let orgId = testId;
let orgName = testId;

let testProjectId = 't1';
let projectId = common.makeId();
let projectName = 'p1';

let prep: interfaces.Prep;

test('1', async t => {
  let resp2: apiToBackend.ToBackendCreateTempMconfigResponse;

  try {
    prep = await prepareTest({
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
            isEmailVerified: common.BoolEnum.TRUE
          }
        ],
        orgs: [
          {
            orgId: orgId,
            ownerEmail: email,
            name: orgName
          }
        ],
        projects: [
          {
            orgId,
            projectId,
            testProjectId,
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
        ],
        connections: [
          {
            projectId: projectId,
            connectionId: 'c1',
            type: common.ConnectionTypeEnum.PostgreSQL
          }
        ]
      },
      loginUserPayload: { email, password }
    });

    let req1: apiToBackend.ToBackendGetDashboardRequest = {
      info: {
        name: apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetDashboard,
        traceId: traceId
      },
      payload: {
        projectId: projectId,
        isRepoProd: false,
        branchId: common.BRANCH_MASTER,
        dashboardId: 'ec_d4'
      }
    };

    let resp1 = await helper.sendToBackend<apiToBackend.ToBackendGetDashboardResponse>(
      {
        httpServer: prep.httpServer,
        loginToken: prep.loginToken,
        req: req1
      }
    );

    let oldMconfigId = resp1.payload.dashboardMconfigs[0].mconfigId;

    let newMconfig = resp1.payload.dashboardMconfigs[0];
    newMconfig.mconfigId = common.makeId();

    let req2: apiToBackend.ToBackendCreateTempMconfigRequest = {
      info: {
        name:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendCreateTempMconfig,
        traceId: traceId
      },
      payload: {
        oldMconfigId: oldMconfigId,
        mconfig: newMconfig
      }
    };

    resp2 = await helper.sendToBackend<apiToBackend.ToBackendCreateTempMconfigResponse>(
      {
        httpServer: prep.httpServer,
        loginToken: prep.loginToken,
        req: req2
      }
    );

    await prep.app.close();
  } catch (e) {
    common.logToConsole(e);
  }

  if (common.isDefined(resp2.info.error)) {
    common.logToConsole(resp2.info.error);
  }

  t.is(resp2.info.error, undefined);
  t.is(resp2.info.status, common.ResponseInfoStatusEnum.Ok);
});
