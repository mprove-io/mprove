import test from 'ava';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { helper } from '~backend/barrels/helper';
import { interfaces } from '~backend/barrels/interfaces';
import { logToConsoleBackend } from '~backend/functions/log-to-console-backend';
import { prepareTest } from '~backend/functions/prepare-test';

let testId = 'backend-create-dashboard__from-ok';

let traceId = testId;

let userId = common.makeId();
let email = `${testId}@example.com`;
let password = '123456';

let orgId = testId;
let orgName = testId;

let testProjectId = 't1';
let projectId = common.makeId();
let projectName = testId;

let dashboardId = common.makeId();
let fromDashboardId = 'ec_d4';

let newTitle = testId;

let prep: interfaces.Prep;

test('1', async t => {
  let resp: apiToBackend.ToBackendCreateDashboardResponse;

  try {
    prep = await prepareTest({
      traceId: traceId,
      deleteRecordsPayload: {
        idempotencyKeys: [testId],
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
            isAdmin: common.BoolEnum.TRUE,
            isEditor: common.BoolEnum.TRUE,
            isExplorer: common.BoolEnum.TRUE
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
        idempotencyKey: testId
      },
      payload: {
        projectId: projectId,
        envId: common.PROJECT_ENV_PROD,
        isRepoProd: false,
        branchId: common.BRANCH_MASTER,
        dashboardId: fromDashboardId
      }
    };

    let resp1 =
      await helper.sendToBackend<apiToBackend.ToBackendGetDashboardResponse>({
        httpServer: prep.httpServer,
        loginToken: prep.loginToken,
        req: req1
      });

    let fromDashboard = resp1.payload.dashboard;

    let req: apiToBackend.ToBackendCreateDashboardRequest = {
      info: {
        name: apiToBackend.ToBackendRequestInfoNameEnum
          .ToBackendCreateDashboard,
        traceId: traceId,
        idempotencyKey: testId
      },
      payload: {
        projectId: projectId,
        isRepoProd: false,
        branchId: common.BRANCH_MASTER,
        envId: common.PROJECT_ENV_PROD,
        newDashboardId: dashboardId,
        fromDashboardId: fromDashboardId,
        dashboardTitle: newTitle,
        accessRoles: fromDashboard.accessRoles.join(', '),
        accessUsers: fromDashboard.accessUsers.join(', '),
        reportsGrid: fromDashboard.reports
      }
    };

    resp =
      await helper.sendToBackend<apiToBackend.ToBackendCreateDashboardResponse>(
        {
          httpServer: prep.httpServer,
          loginToken: prep.loginToken,
          req: req
        }
      );

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
