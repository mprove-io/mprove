import test from 'ava';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { helper } from '~backend/barrels/helper';
import { interfaces } from '~backend/barrels/interfaces';
import { logToConsoleBackend } from '~backend/functions/log-to-console-backend';
import { prepareTestAndSeed } from '~backend/functions/prepare-test';

let testId = 'backend-create-draft-dashboard__ok';

let traceId = testId;

let userId = common.makeId();
let email = `${testId}@example.com`;
let password = '123456';

let orgId = testId;
let orgName = testId;

let testProjectId = 't2';
let projectId = common.makeId();
let projectName = testId;

let oldDashboardId = 'd1';

let prep: interfaces.Prep;

test('1', async t => {
  let resp: apiToBackend.ToBackendCreateDraftDashboardResponse;

  try {
    prep = await prepareTestAndSeed({
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
            defaultBranch: common.BRANCH_MAIN,
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
            connectionId: 'c7',
            envId: common.PROJECT_ENV_PROD,
            type: common.ConnectionTypeEnum.GoogleApi
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
        branchId: common.BRANCH_MAIN,
        envId: common.PROJECT_ENV_PROD,
        dashboardId: oldDashboardId,
        timezone: 'UTC'
      }
    };

    let resp1 =
      await helper.sendToBackend<apiToBackend.ToBackendGetDashboardResponse>({
        httpServer: prep.httpServer,
        loginToken: prep.loginToken,
        req: req1
      });

    // console.log('resp1');
    // console.log(resp1);

    let req: apiToBackend.ToBackendCreateDraftDashboardRequest = {
      info: {
        name: apiToBackend.ToBackendRequestInfoNameEnum
          .ToBackendCreateDraftDashboard,
        traceId: traceId,
        idempotencyKey: common.makeId()
      },
      payload: {
        projectId: projectId,
        isRepoProd: false,
        branchId: common.BRANCH_MAIN,
        envId: common.PROJECT_ENV_PROD,
        oldDashboardId: oldDashboardId,
        newDashboardId: common.makeId(),
        newDashboardFields: resp1.payload.dashboard.fields,
        tiles: resp1.payload.dashboard.tiles,
        timezone: 'UTC'
      }
    };

    resp =
      await helper.sendToBackend<apiToBackend.ToBackendCreateDraftDashboardResponse>(
        {
          httpServer: prep.httpServer,
          loginToken: prep.loginToken,
          req: req
        }
      );

    // console.log('resp');
    // console.log(resp);

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
