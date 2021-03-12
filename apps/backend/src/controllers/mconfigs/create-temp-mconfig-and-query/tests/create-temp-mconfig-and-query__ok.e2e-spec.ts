import test from 'ava';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { helper } from '~backend/barrels/helper';
import { interfaces } from '~backend/barrels/interfaces';
import { prepareTest } from '~backend/functions/prepare-test';

let testId = 'backend-create-temp-mconfig-and-query__ok';

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
  let resp2: apiToBackend.ToBackendCreateTempMconfigAndQueryResponse;

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
        repoId: userId,
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

    let query = resp1.payload.dashboardQueries[0];
    let mconfig = resp1.payload.dashboardMconfigs[0];
    mconfig.mconfigId = common.makeId();

    let req2: apiToBackend.ToBackendCreateTempMconfigAndQueryRequest = {
      info: {
        name:
          apiToBackend.ToBackendRequestInfoNameEnum
            .ToBackendCreateTempMconfigAndQuery,
        traceId: traceId
      },
      payload: {
        mconfig: mconfig
      }
    };

    resp2 = await helper.sendToBackend<apiToBackend.ToBackendCreateTempMconfigAndQueryResponse>(
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
