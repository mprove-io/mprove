import test from 'ava';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { helper } from '~backend/barrels/helper';
import { interfaces } from '~backend/barrels/interfaces';
import { logToConsoleBackend } from '~backend/functions/log-to-console-backend';
import { prepareTest } from '~backend/functions/prepare-test';

let testId = 'backend-modify-viz__ok';

let traceId = testId;

let userId = common.makeId();
let email = `${testId}@example.com`;
let password = '123456';

let orgId = testId;
let orgName = testId;

let newTitle = testId;

let testProjectId = 't1';
let projectId = common.makeId();
let projectName = testId;

let chartId = 'ec_s1';

let prep: interfaces.Prep;

test('1', async t => {
  let resp: apiToBackend.ToBackendModifyVizResponse;

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
            isEmailVerified: true
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
            name: projectName,
            defaultBranch: common.BRANCH_MASTER,
            remoteType: common.ProjectRemoteTypeEnum.Managed
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
        ],
        connections: [
          {
            projectId: projectId,
            connectionId: 'c1',
            envId: common.PROJECT_ENV_PROD,
            type: common.ConnectionTypeEnum.PostgreSQL
          }
        ]
      },
      loginUserPayload: { email, password }
    });

    let req1: apiToBackend.ToBackendGetDashboardRequest = {
      info: {
        name: apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetDashboard,
        traceId: traceId,
        idempotencyKey: common.makeId()
      },
      payload: {
        projectId: projectId,
        isRepoProd: false,
        branchId: common.BRANCH_MASTER,
        envId: common.PROJECT_ENV_PROD,
        dashboardId: 'ec_d4'
      }
    };

    let resp1 =
      await helper.sendToBackend<apiToBackend.ToBackendGetDashboardResponse>({
        httpServer: prep.httpServer,
        loginToken: prep.loginToken,
        req: req1
      });

    let newMconfig = resp1.payload.dashboard.tiles[0].mconfig;

    let req: apiToBackend.ToBackendModifyVizRequest = {
      info: {
        name: apiToBackend.ToBackendRequestInfoNameEnum.ToBackendModifyViz,
        traceId: traceId,
        idempotencyKey: common.makeId()
      },
      payload: {
        projectId: projectId,
        isRepoProd: false,
        branchId: common.BRANCH_MASTER,
        envId: common.PROJECT_ENV_PROD,
        chartId: chartId,
        mconfig: newMconfig,
        tileTitle: newTitle
      }
    };

    resp = await helper.sendToBackend<apiToBackend.ToBackendModifyVizResponse>({
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
