import assert from 'node:assert/strict';
import retry from 'async-retry';
import test from 'ava';
import { logToConsoleBackend } from '#backend/functions/log-to-console-backend';
import { prepareTestAndSeed } from '#backend/functions/prepare-test';
import { sendToBackend } from '#backend/functions/send-to-backend';
import { Prep } from '#backend/interfaces/prep';
import {
  BRANCH_MAIN,
  EMPTY_STORE_GOOGLE_API_OPTIONS,
  PROJECT_ENV_PROD,
  UTC
} from '#common/constants/top';
import { BACKEND_E2E_RETRY_OPTIONS } from '#common/constants/top-backend';
import { ConnectionTypeEnum } from '#common/enums/connection-type.enum';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { ProjectRemoteTypeEnum } from '#common/enums/project-remote-type.enum';
import { makeId } from '#common/functions/make-id/make-id';
import { unwrapToBackendResponse } from '#common/functions/unwrap-to-backend-response/unwrap-to-backend-response';
import type { ToBackendGetDashboardRequest } from '#common/zod/backend/routes/dashboards/get-dashboard/get-dashboard-request';
import type { ToBackendSaveCreateDashboardRequest } from '#common/zod/backend/routes/dashboards/save-create-dashboard/save-create-dashboard-request';
import type { ToBackendSaveCreateDashboardResponse } from '#common/zod/backend/routes/dashboards/save-create-dashboard/save-create-dashboard-response';

let testId = 'backend-save-create-dashboard__from-ok';

let traceId = testId;

let userId = makeId();
let email = `${testId}@example.com`;
let password = '123456';

let orgId = testId;
let orgName = testId;

let seedProjectId = 't2';
let projectId = makeId();
let projectName = testId;

let dashboardId = makeId();
let fromDashboardId = 'd1';

let newTitle = testId;

test('1', async t => {
  let isPass: boolean;
  let prep: Prep;

  await retry(async (bail: any) => {
    let resp: ToBackendSaveCreateDashboardResponse;

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
              seedProjectId: seedProjectId,
              name: projectName,
              defaultBranch: BRANCH_MAIN,
              remoteType: ProjectRemoteTypeEnum.Managed
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
              envId: PROJECT_ENV_PROD,
              type: ConnectionTypeEnum.GoogleApi,
              options: {
                storeGoogleApi: EMPTY_STORE_GOOGLE_API_OPTIONS
              }
            }
          ]
        },
        loginUserPayload: { email, password }
      });

      let req1: ToBackendGetDashboardRequest = {
        traceId: traceId,
        idempotencyKey: makeId(),
        input: {
          projectId: projectId,
          envId: PROJECT_ENV_PROD,
          repoId: userId,
          branchId: BRANCH_MAIN,
          dashboardId: fromDashboardId,
          timezone: 'UTC'
        }
      };

      let resp1 = await sendToBackend({
        route: 'api/ToBackendGetDashboard',
        httpServer: prep.httpServer,
        loginToken: prep.loginToken,
        req: req1
      });

      let fromDashboard = unwrapToBackendResponse({
        response: resp1
      }).dashboard;

      let req: ToBackendSaveCreateDashboardRequest = {
        traceId: traceId,
        idempotencyKey: makeId(),
        input: {
          projectId: projectId,
          repoId: userId,
          branchId: BRANCH_MAIN,
          envId: PROJECT_ENV_PROD,
          newDashboardId: dashboardId,
          fromDashboardId: fromDashboardId,
          dashboardTitle: newTitle,
          accessRoles: fromDashboard.accessRoles,
          tilesGrid: fromDashboard.tiles,
          timezone: UTC
        }
      };

      resp = await sendToBackend({
        route: 'api/ToBackendSaveCreateDashboard',
        httpServer: prep.httpServer,
        loginToken: prep.loginToken,
        req: req
      });

      await prep.app.close();
    } catch (e) {
      logToConsoleBackend({
        log: e,
        logLevel: LogLevelEnum.Error,
        logger: prep?.logger,
        cs: prep?.cs
      });
      if (prep) {
        await prep.app.close();
      }
    }

    assert.equal(resp.result.type, 'Success');

    isPass = true;
  }, BACKEND_E2E_RETRY_OPTIONS).catch((er: any) => {
    logToConsoleBackend({
      log: er,
      logLevel: LogLevelEnum.Error,
      logger: prep?.logger,
      cs: prep?.cs
    });
  });

  t.is(isPass, true);
});
